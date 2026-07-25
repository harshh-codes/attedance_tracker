import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    } else if (user?.role === 'EMPLOYEE') {
      navigate('/employee/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-6 py-12">
      <div className="max-w-md w-full glass-card rounded-2xl p-8 border border-slate-800 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">403 - Access Denied</h1>
        <p className="text-xs text-slate-400 mb-6">
          You do not have permission to view this resource. This area is restricted to authorized role permissions only.
        </p>

        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-sm font-semibold text-slate-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Authorized Portal</span>
        </button>
      </div>
    </div>
  );
}
