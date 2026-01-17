
import React, { useState, useRef } from 'react';
import { analyzeResume } from '../services/gemini';
import { AnalysisResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ResumeAnalyzerProps {
  onFindJobs: (query: string) => void;
}

const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({ onFindJobs }) => {
  const [resumeText, setResumeText] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; data: string; mimeType: string } | null>(null);
  const [inputType, setInputType] = useState<'upload' | 'text'>('upload');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      setSelectedFile({
        name: file.name,
        data: base64Data,
        mimeType: file.type || 'application/pdf'
      });
      setInputType('upload');
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const input = inputType === 'upload' && selectedFile 
        ? { data: selectedFile.data, mimeType: selectedFile.mimeType }
        : resumeText;

      if (!input) return;

      const analysis = await analyzeResume(input, role);
      setResult(analysis);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const data = result ? [
    { name: 'Match', value: result.matchScore },
    { name: 'Gap', value: 100 - result.matchScore },
  ] : [];

  const COLORS = ['#4f46e5', '#f3f4f6'];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Resume Intel</h1>
        <p className="mt-3 text-lg text-gray-500">Upload your resume for a comprehensive AI evaluation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-bold text-gray-900">Input Profile</h3>
               <div className="flex bg-gray-100 p-1 rounded-xl">
                 <button 
                  onClick={() => setInputType('upload')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${inputType === 'upload' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                 >
                   File
                 </button>
                 <button 
                  onClick={() => setInputType('text')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${inputType === 'text' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                 >
                   Text
                 </button>
               </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Target Career Path</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Software Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                />
              </div>

              {inputType === 'upload' ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-indigo-400', 'bg-indigo-50'); }}
                  onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-50'); }}
                  onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-50'); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
                  className="relative group cursor-pointer border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-indigo-400 transition-all"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                  />
                  {selectedFile ? (
                    <div className="space-y-3">
                      <div className="bg-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <p className="font-bold text-gray-900 truncate max-w-[200px] mx-auto">{selectedFile.name}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} 
                        className="text-xs text-red-500 hover:underline font-bold"
                      >
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gray-50 text-gray-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:bg-indigo-100 group-hover:text-indigo-500 transition-all">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Click to upload or drag & drop</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOCX, or TXT (Max 5MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Resume Text</label>
                  <textarea
                    rows={10}
                    placeholder="Paste your resume content..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-sm leading-relaxed"
                  ></textarea>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading || (inputType === 'upload' ? !selectedFile : !resumeText.trim())}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Parsing Document...
                  </span>
                ) : 'Analyze Resume'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm h-full flex flex-col animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
                 <h3 className="text-2xl font-black text-gray-900">Report Summary</h3>
                 <button 
                  onClick={() => onFindJobs(role || "Relevant roles for my profile")}
                  className="w-full sm:w-auto bg-green-500 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-lg shadow-green-100"
                 >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                   Find Matching Jobs
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                <div className="relative h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        innerRadius={75}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-5xl font-black text-indigo-600 leading-none">{result.matchScore}%</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Market Relevance</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
                    Strategic Roadmap
                  </h4>
                  <div className="space-y-3">
                    {result.recommendations.slice(0, 3).map((r, i) => (
                      <div key={i} className="text-sm text-gray-700 bg-gray-50 p-4 rounded-2xl border-l-4 border-indigo-400 font-medium">
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                <div className="bg-green-50/50 p-8 rounded-[2rem] border border-green-100">
                  <h4 className="text-xs font-black text-green-700 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Asset Highlights
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.strengths.map((s, i) => (
                      <span key={i} className="bg-white px-4 py-2 rounded-xl text-xs font-bold text-green-800 border border-green-200 shadow-sm">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50/50 p-8 rounded-[2rem] border border-amber-100">
                  <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Development Areas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.gaps.map((g, i) => (
                      <span key={i} className="bg-white px-4 py-2 rounded-xl text-xs font-bold text-amber-800 border border-amber-200 shadow-sm">{g}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center p-12 text-center text-gray-400">
              <div className="bg-gray-50 p-12 rounded-full mb-8 group hover:bg-indigo-50 transition-colors">
                <svg className="w-20 h-20 opacity-20 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-500">Awaiting Intelligence</h3>
              <p className="text-sm text-gray-400 max-w-xs mt-2">Analysis results will be generated instantly after scanning your resume file.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
