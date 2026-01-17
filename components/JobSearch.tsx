
import React, { useState, useEffect } from 'react';
import { searchJobsWithGrounding } from '../services/gemini';
import { Job } from '../types';

interface JobSearchProps {
  initialQuery?: string;
}

const JobSearch: React.FC<JobSearchProps> = ({ initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sources, setSources] = useState<any[]>([]);

  const quickFilters = [
    "Remote Frontend React",
    "Junior Data Analyst",
    "AI Product Manager",
    "Full Stack Python Remote",
    "Cybersecurity Entry Level"
  ];

  const handleSearch = async (searchStr: string) => {
    const finalQuery = searchStr || query;
    if (!finalQuery.trim()) return;

    setLoading(true);
    try {
      const result = await searchJobsWithGrounding(finalQuery);
      setJobs(result.jobs);
      setSources(result.sources);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl">
          Smart Job Discovery
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          Gemini scans the live web across hundreds of free public job boards to find your perfect match.
        </p>
      </div>

      <div className="space-y-4">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} 
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Job title, keywords, or company..."
              className="w-full pl-11 pr-5 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm text-lg"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold shadow-lg disabled:opacity-50 transition-all active:scale-95 whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Web...
              </span>
            ) : 'Find Jobs'}
          </button>
        </form>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">Quick Finds:</span>
          {quickFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => { setQuery(filter); handleSearch(filter); }}
              className="text-sm bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 px-4 py-1.5 rounded-full transition-all text-gray-600"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-3xl shimmer border border-gray-100"></div>
          ))}
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="grid gap-6">
          {jobs.map((job, idx) => (
            <div key={idx} className="glass-card p-8 rounded-3xl hover:border-indigo-300 transition-all group border-transparent">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                     <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                     <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-tighter">New</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <p className="text-indigo-600 font-bold">{job.company}</p>
                    <p className="text-gray-400 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {job.location}
                    </p>
                  </div>
                </div>
                {job.link && (
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto text-center bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
                  >
                    Apply on Board
                  </a>
                )}
              </div>
              <p className="text-gray-600 text-base leading-relaxed mb-6 border-l-4 border-indigo-100 pl-4 italic">
                {job.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {job.tags?.map((tag, tIdx) => (
                  <span key={tIdx} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && jobs.length === 0 && !query && (
        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
           <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           </div>
           <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Discover?</h3>
           <p className="text-gray-500">Enter a role above to search millions of live postings via Gemini AI.</p>
        </div>
      )}

      {sources.length > 0 && (
        <div className="mt-16 p-8 bg-indigo-900 rounded-[2.5rem] text-white">
          <div className="flex items-center gap-3 mb-6">
             <div className="bg-indigo-400/30 p-2 rounded-lg">
                <svg className="w-5 h-5 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
             </div>
             <h4 className="text-lg font-bold tracking-tight">AI Verification Sources</h4>
          </div>
          <p className="text-indigo-200 text-sm mb-6 max-w-xl">
            Our AI engine double-checks these domains to ensure these listings are current and from legitimate platforms.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {sources.map((source, idx) => (
              source.web && (
                <a
                  key={idx}
                  href={source.web.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-indigo-800/50 hover:bg-indigo-700/50 px-4 py-3 rounded-2xl text-xs text-indigo-100 transition-colors border border-indigo-700/50 truncate flex items-center gap-2"
                >
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                  {source.web.title || source.web.uri}
                </a>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSearch;
