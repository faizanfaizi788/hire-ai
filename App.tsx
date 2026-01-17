
import React, { useState } from 'react';
import { AppView } from './types';
import Layout from './components/Layout';
import JobSearch from './components/JobSearch';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import InterviewPrep from './components/InterviewPrep';
import LiveInterview from './components/LiveInterview';

const HomeView: React.FC<{ setView: (v: AppView) => void }> = ({ setView }) => (
  <div className="space-y-16 py-10 animate-in fade-in duration-700">
    <section className="text-center space-y-8">
      <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full mb-4">
        <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Real-time Job Data Powered by Gemini</span>
      </div>
      <h1 className="text-5xl md:text-8xl font-black text-gray-900 tracking-tighter leading-[0.9]">
        Find Jobs <br />
        <span className="text-indigo-600">With Intent</span>
      </h1>
      <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
        Stop scrolling. Start discovering. HireAI uses the Gemini Live Web Grounding to find listings across hundreds of platforms in seconds.
      </p>
      <div className="flex flex-wrap justify-center gap-6 pt-4">
        <button 
          onClick={() => setView(AppView.Search)}
          className="bg-indigo-600 text-white px-10 py-5 rounded-3xl text-lg font-bold shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-1 active:scale-95"
        >
          Discover Roles
        </button>
        <button 
          onClick={() => setView(AppView.LiveMock)}
          className="bg-white text-gray-900 border-2 border-gray-100 px-10 py-5 rounded-3xl text-lg font-bold hover:border-indigo-100 hover:text-indigo-600 transition-all shadow-xl shadow-gray-100"
        >
          Mock Interview
        </button>
      </div>
    </section>

    <section className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {[
        {
          title: 'Live Web Grounding',
          desc: 'Our engine uses real-time Google Search to scan active Greenhouse, Lever, and LinkedIn postings.',
          icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
          view: AppView.Search,
          color: 'indigo'
        },
        {
          title: 'Deep Resume Intel',
          desc: 'Get an instant benchmark score and identifying exact missing skills for your dream role.',
          icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
          view: AppView.Resume,
          color: 'emerald'
        },
        {
          title: 'Gemini Live Mock',
          desc: 'Practice with a real-time voice assistant that adapts to your answers with zero latency.',
          icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
          view: AppView.LiveMock,
          color: 'rose'
        }
      ].map((feature, i) => (
        <div 
          key={i} 
          onClick={() => setView(feature.view)}
          className="bg-white p-10 rounded-[2.5rem] border border-gray-100 hover:border-indigo-100 transition-all group cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1"
        >
          <div className="bg-gray-50 text-gray-800 p-4 rounded-2xl w-fit mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            {feature.icon}
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">{feature.title}</h3>
          <p className="text-gray-500 leading-relaxed font-medium text-base">{feature.desc}</p>
        </div>
      ))}
    </section>

    <div className="bg-indigo-600 rounded-[4rem] p-16 text-white relative overflow-hidden shadow-2xl">
      <div className="relative z-10 max-w-3xl">
        <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Your Career <br /> Infrastructure</h2>
        <p className="text-indigo-100 text-xl mb-10 leading-relaxed max-w-xl font-medium">
          Whether you're starting fresh or leveling up, HireAI's tools are designed to remove friction from the application process.
        </p>
        <button 
          onClick={() => setView(AppView.Interview)}
          className="bg-white text-indigo-600 px-10 py-4 rounded-2xl font-black hover:bg-indigo-50 transition-all active:scale-95"
        >
          Prep Strategy
        </button>
      </div>
      <div className="absolute right-[-10%] bottom-[-10%] opacity-20 transform rotate-12">
        <svg className="w-[30rem] h-[30rem]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.Home);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const navigateToSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentView(AppView.Search);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.Home:
        return <HomeView setView={setCurrentView} />;
      case AppView.Search:
        return <JobSearch initialQuery={searchQuery} />;
      case AppView.Resume:
        return <ResumeAnalyzer onFindJobs={navigateToSearch} />;
      case AppView.Interview:
        return <InterviewPrep />;
      case AppView.LiveMock:
        return <LiveInterview />;
      default:
        return <HomeView setView={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} setView={(v) => {
      if (v !== AppView.Search) setSearchQuery(''); // Reset query when navigating elsewhere
      setCurrentView(v);
    }}>
      {renderView()}
    </Layout>
  );
};

export default App;
