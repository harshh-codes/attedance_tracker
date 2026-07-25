import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';
import { requestPasswordReset } from '../services/registrationService';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submittedMessage, setSubmittedMessage] = useState('');
  const [devToken, setDevToken] = useState('');

  const validate = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setFieldError('Email address is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setFieldError('Please enter a valid email address');
      return false;
    }
    setFieldError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');
    setSubmittedMessage('');

    try {
      const res = await requestPasswordReset(email.trim());
      if (res.success) {
        setSubmittedMessage(res.message);
        if (res.devToken) {
          setDevToken(res.devToken);
        }
      }
    } catch (err) {
      setServerError(err.message || 'Failed to send password reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Header Branding */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <Building2 className="w-7 h-7 stroke-[2.5]" />
          </div>
        </div>

        <h2 className="text-center text-2xl font-extrabold text-white tracking-tight">
          Forgot Password
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Enter your registered email address to receive a secure password reset link.
        </p>

        <div className="mt-6 bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          {submittedMessage ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <h3 className="text-lg font-bold text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                {submittedMessage}
              </p>

              {devToken && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-left">
                  <span className="text-[11px] text-amber-400 font-semibold block flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Instant Dev Reset Option</span>
                  </span>
                  <p className="text-[11px] text-slate-400">
                    You can test resetting your password immediately using the generated dev token:
                  </p>
                  <button
                    onClick={() => navigate(`/reset-password/${devToken}`)}
                    className="w-full py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Proceed to Reset Password Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {serverError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldError) setFieldError('');
                      if (serverError) setServerError('');
                    }}
                    placeholder="e.g. rajesh.sharma@landmarkdevelopers.com"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border ${
                      fieldError ? 'border-rose-500/80' : 'border-slate-800 focus:border-amber-500'
                    } rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-all`}
                  />
                </div>
                {fieldError && (
                  <p className="text-[11px] text-rose-400 mt-1">{fieldError}</p>
                )}
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Reset Link...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>

                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
