import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleHome = () => {
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
      <div className="max-w-md w-full glass-card rounded-2xl p-8 border border-slate-800 shadow-2xl text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
          <FileQuestion className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">404 - Page Not Found</h1>
        <p className="text-xs text-slate-400">
          The requested URL path does not exist in the Landmark Developers Attendance System portal.
        </p>

        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <button
            onClick={handleHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950"
          >
            <Home className="w-4 h-4" />
            <span>Return to Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
