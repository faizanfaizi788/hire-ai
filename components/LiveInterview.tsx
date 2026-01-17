
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getGeminiClient, decode, decodeAudioData, encode } from '../services/gemini';
import { Modality, LiveServerMessage, Blob } from '@google/genai';

const LiveInterview: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    setIsActive(false);
  }, []);

  const startSession = async () => {
    setError(null);
    setTranscription([]);
    
    try {
      const ai = getGeminiClient();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            setIsActive(true);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle output audio
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              
              const playTime = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              source.start(playTime);
              nextStartTimeRef.current = playTime + buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            // Handle transcription if enabled
            if (msg.serverContent?.outputTranscription) {
              setTranscription(prev => [...prev, `AI: ${msg.serverContent!.outputTranscription!.text}`]);
            }
            if (msg.serverContent?.inputTranscription) {
              setTranscription(prev => [...prev, `You: ${msg.serverContent!.inputTranscription!.text}`]);
            }

            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setError("Connection error. Please check your API key.");
            stopSession();
          },
          onclose: () => {
            setIsActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are a friendly expert tech interviewer. Conduct a professional, conversational mock interview. Ask one question at a time. Keep responses concise and focused on the user's career path.",
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start interview session.");
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, [stopSession]);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center space-y-6 mb-12">
        <h1 className="text-4xl font-black text-gray-900">AI Live Mock Interview</h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Experience a real-time voice conversation with Gemini. Practice your interview skills with zero latency.
        </p>
      </div>

      <div className="relative aspect-video rounded-3xl bg-gray-900 flex items-center justify-center overflow-hidden shadow-2xl border-4 border-gray-800">
        {!isActive ? (
          <div className="text-center space-y-6 z-10">
            <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </div>
            <button
              onClick={startSession}
              className="px-8 py-3 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Start Practice Session
            </button>
            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col p-8">
            <div className="flex-1 overflow-y-auto space-y-4 scroll-smooth">
              {transcription.map((text, idx) => (
                <div key={idx} className={`p-3 rounded-lg text-sm ${text.startsWith('AI') ? 'bg-indigo-900/50 text-indigo-100 ml-4' : 'bg-gray-800/50 text-gray-100 mr-4 text-right'}`}>
                  {text}
                </div>
              ))}
              <div className="h-4"></div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                <span className="text-green-400 text-xs font-bold uppercase">Live Recording</span>
              </div>
              <button
                onClick={stopSession}
                className="px-6 py-2 bg-red-600 text-white rounded-full text-xs font-bold hover:bg-red-700 transition-all"
              >
                End Session
              </button>
            </div>
          </div>
        )}
        
        {/* Background Visualizer Effect */}
        {isActive && (
           <div className="absolute inset-0 opacity-20 pointer-events-none">
             <div className="flex items-end justify-center h-full gap-1 px-10">
                {Array.from({length: 20}).map((_, i) => (
                  <div key={i} className="bg-indigo-500 w-1 flex-1" style={{height: `${Math.random() * 80 + 10}%`, transition: 'height 0.1s ease'}}></div>
                ))}
             </div>
           </div>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
          <h4 className="text-indigo-900 font-bold mb-1 text-sm">Real-time Feedback</h4>
          <p className="text-xs text-indigo-700">Instant audio responses without text delays.</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <h4 className="text-gray-900 font-bold mb-1 text-sm">Adaptive Topics</h4>
          <p className="text-xs text-gray-600">AI adjusts based on your spoken answers.</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <h4 className="text-gray-900 font-bold mb-1 text-sm">Safe Practice</h4>
          <p className="text-xs text-gray-600">Zero judgment, just improvement.</p>
        </div>
      </div>
    </div>
  );
};

export default LiveInterview;
