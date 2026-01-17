
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Job, AnalysisResult, InterviewQuestion } from "../types";

const API_KEY = process.env.API_KEY || "";

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: API_KEY });
};

/**
 * Searches for jobs using Gemini with Google Search Grounding.
 */
export const searchJobsWithGrounding = async (query: string): Promise<{ jobs: Job[], sources: any[] }> => {
  const ai = getGeminiClient();
  
  const searchResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Search the web for the 6 most recent and high-quality job postings matching: "${query}". 
    Look specifically at diverse sources like LinkedIn, Indeed, Greenhouse, Lever, and company career pages. 
    Ensure the jobs are active and provide direct links where possible.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const groundingChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const structuredResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the following search results about job openings: "${searchResponse.text}", 
    extract and structure them into a JSON array. 
    Focus on accuracy. If a link or salary isn't clear, omit it.
    Use this schema strictly.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            company: { type: Type.STRING },
            location: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            link: { type: Type.STRING }
          },
          required: ["title", "company", "location", "description"]
        }
      }
    }
  });

  let jobs = [];
  try {
    jobs = JSON.parse(structuredResponse.text);
  } catch (e) {
    console.error("Failed to parse jobs JSON:", e);
  }

  return { jobs, sources: groundingChunks };
};

/**
 * Analyzes resume content. Supports either raw text or a base64 encoded file object.
 */
export const analyzeResume = async (
  input: string | { data: string; mimeType: string }, 
  targetRole?: string
): Promise<AnalysisResult> => {
  const ai = getGeminiClient();
  
  const promptText = targetRole 
    ? `Analyze this resume for a ${targetRole} position. Evaluate match percentage and identify missing keywords or experiences.`
    : `Analyze this resume. Identify the candidate's core expertise, suggest target roles, and list missing skills for those roles.`;

  const contents: any[] = [];
  
  if (typeof input === 'string') {
    contents.push({ parts: [{ text: `${promptText}\n\nResume Content:\n${input}` }] });
  } else {
    contents.push({
      parts: [
        { text: promptText },
        {
          inlineData: {
            data: input.data,
            mimeType: input.mimeType
          }
        }
      ]
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: contents[0],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchScore: { type: Type.NUMBER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["matchScore", "strengths", "gaps", "recommendations"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateInterviewQuestions = async (role: string): Promise<InterviewQuestion[]> => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 5 challenging behavioral and technical interview questions for a ${role} role. For each, explain what the interviewer is looking for and give a tip on how to answer using the STAR method.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            intent: { type: Type.STRING },
            tips: { type: Type.STRING }
          },
          required: ["question", "intent", "tips"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
