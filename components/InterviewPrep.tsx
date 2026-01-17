
import React, { useState } from 'react';
import { generateInterviewQuestions } from '../services/gemini';
import { InterviewQuestion } from '../types';

const InterviewPrep: React.FC = () => {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);

  const handleGenerate = async () => {
    if (!role.trim()) return;
    setLoading(true);
    try {
      const qs = await generateInterviewQuestions(role);
      setQuestions(qs);
    } catch (error) {
      console.error("Prep failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900">Interview Strategist</h1>
        <p className="mt-2 text-gray-500">Master the most challenging questions for any role.</p>
      </div>

      <div className="flex gap-2 max-w-2xl mx-auto">
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Enter target job title (e.g. Senior UX Designer)"
          className="flex-1 px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !role.trim()}
          className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-xl font-semibold shadow-lg disabled:opacity-50 transition-all"
        >
          {loading ? 'Preparing...' : 'Get Questions'}
        </button>
      </div>

      <div className="space-y-6 mt-8">
        {questions.map((q, idx) => (
          <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-start gap-4">
              <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{q.question}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Interviewer Intent</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{q.intent}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Expert Tip</h4>
                    <p className="text-sm text-indigo-600 leading-relaxed bg-indigo-50 p-3 rounded-lg">{q.tips}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!loading && questions.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl">
             <div className="text-gray-400">Enter a role above to generate tailored interview prep</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;
