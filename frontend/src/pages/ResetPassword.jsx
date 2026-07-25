import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Building2, Lock, Eye, EyeOff, Check, X, AlertCircle, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { executePasswordReset } from '../services/registrationService';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password rules check
  const hasMinLen = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const isPasswordValid = hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial;
  const doesMatch = newPassword && newPassword === confirmPassword;

  // Calculate strength score
  const getStrength = () => {
    let count = 0;
    if (hasMinLen) count++;
    if (hasUpper) count++;
    if (hasLower) count++;
    if (hasNumber) count++;
    if (hasSpecial) count++;

    if (count <= 2) return { score: 30, label: 'Weak', color: 'bg-rose-500' };
    if (count === 3 || count === 4) return { score: 70, label: 'Medium', color: 'bg-amber-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setServerError('Reset token is missing or invalid.');
      return;
    }

    if (!isPasswordValid) {
      setServerError('Please ensure your password meets all complexity requirements.');
      return;
    }

    if (!doesMatch) {
      setServerError('Confirm password does not match.');
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      const res = await executePasswordReset({
        token,
        newPassword,
        confirmPassword
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Password reset successfully. Please sign in.' }
          });
        }, 2500);
      }
    } catch (err) {
      setServerError(err.message || 'Password reset failed. The link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <Building2 className="w-7 h-7 stroke-[2.5]" />
          </div>
        </div>

        <h2 className="text-center text-2xl font-extrabold text-white tracking-tight">
          Reset Password
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Create a new strong password for your Landmark Developers account.
        </p>

        <div className="mt-6 bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Password Reset Complete!</h3>
              <p className="text-xs text-slate-300">
                Password reset successfully. Redirecting you to sign in...
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all"
                >
                  <span>Sign In Now</span>
                  <ArrowRight className="w-4 h-4" />
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

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (serverError) setServerError('');
                    }}
                    placeholder="Enter new password"
                    className="w-full pl-9 pr-9 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Bar */}
                {newPassword && (
                  <div className="mt-1.5 space-y-1">
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 text-right">
                      Strength: <span className="font-semibold text-slate-200">{strength.label}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm New Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (serverError) setServerError('');
                    }}
                    placeholder="Confirm new password"
                    className="w-full pl-9 pr-9 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1.5 text-[11px]">
                <p className="font-semibold text-slate-400 mb-1">Password Requirements:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-slate-400">
                  <div className={`flex items-center gap-1.5 ${hasMinLen ? 'text-emerald-400 font-medium' : ''}`}>
                    {hasMinLen ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                    <span>Min 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-400 font-medium' : ''}`}>
                    {hasUpper ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                    <span>1 Uppercase (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-400 font-medium' : ''}`}>
                    {hasLower ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                    <span>1 Lowercase (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400 font-medium' : ''}`}>
                    {hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                    <span>1 Number (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-400 font-medium' : ''}`}>
                    {hasSpecial ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                    <span>1 Special char</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${doesMatch ? 'text-emerald-400 font-medium' : ''}`}>
                    {doesMatch ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !isPasswordValid || !doesMatch}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Reset Password & Sign In</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
