import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ServerCrash, RefreshCw } from 'lucide-react';

export default function ServerError() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-6 py-12">
      <div className="max-w-md w-full glass-card rounded-2xl p-8 border border-slate-800 shadow-2xl text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <ServerCrash className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">500 - System Server Error</h1>
        <p className="text-xs text-slate-400">
          An unexpected error occurred while processing your system request. Please try refreshing or contact IT Support.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload Application</span>
        </button>
      </div>
    </div>
  );
}
