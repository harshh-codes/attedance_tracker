import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Building2, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { verifyEmailToken } from '../services/registrationService';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function doVerify() {
      if (!token) {
        setLoading(false);
        setMessage('Missing email verification token');
        return;
      }
      try {
        setLoading(true);
        const res = await verifyEmailToken(token);
        if (res.success) {
          setSuccess(true);
          setMessage(res.message || 'Email address verified successfully!');
        }
      } catch (err) {
        setSuccess(false);
        setMessage(err.message || 'Email verification failed or token has expired.');
      } finally {
        setLoading(false);
      }
    }
    doVerify();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <Building2 className="w-7 h-7 stroke-[2.5]" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-5">
          {loading ? (
            <div className="py-6 space-y-3">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-300">Verifying your email address...</p>
            </div>
          ) : success ? (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Email Address Verified!</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {message}
              </p>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-left space-y-1 text-xs">
                <span className="text-amber-400 font-semibold block">Next Step: Administrator Review</span>
                <span className="text-slate-400">
                  Your application is now under review by system administrators. You will be notified once your Department and Employee ID are assigned.
                </span>
              </div>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all"
                >
                  <span>Go to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Verification Failed</h3>
              <p className="text-xs text-rose-400">{message}</p>
              <div className="pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-all"
                >
                  Back to Registration
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
