import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PlaceholderModule({ moduleName, description }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto">
      <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 shadow-xl shadow-amber-500/10">
        <Construction className="w-10 h-10 animate-bounce" />
      </div>

      <h2 className="text-2xl font-extrabold text-white mb-2">{moduleName} Module</h2>
      <p className="text-xs text-slate-400 leading-relaxed mb-6">
        {description || 'This feature is currently under active development. It will be enabled in subsequent releases following database and business logic verification.'}
      </p>

      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 max-w-md w-full mb-6">
        <span className="font-semibold text-amber-400">⚡ Status Note:</span><br />
        Frontend UI shell and route handlers are pre-configured. Business logic API integration is scheduled for the upcoming module sprint.
      </div>

      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Previous Page</span>
      </button>
    </div>
  );
}
