import React, { useState } from 'react';
import { X, Lock, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { changePassword } from '../../services/systemService';

export default function ChangePasswordModal({ isOpen, onClose, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Password Complexity Evaluation
  const rules = [
    { label: 'At least 8 characters long', valid: newPassword.length >= 8 },
    { label: 'At least 1 uppercase letter (A-Z)', valid: /[A-Z]/.test(newPassword) },
    { label: 'At least 1 lowercase letter (a-z)', valid: /[a-z]/.test(newPassword) },
    { label: 'At least 1 number (0-9)', valid: /\d/.test(newPassword) },
    { label: 'At least 1 special character (@$!%*?&#)', valid: /[@$!%*?&#]/.test(newPassword) }
  ];

  const allRulesPassed = rules.every(r => r.valid) && newPassword === confirmPassword && confirmPassword !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentPassword) {
      setErrorMsg('Current password is required');
      return;
    }

    if (!allRulesPassed) {
      setErrorMsg('Please ensure all password strength requirements are met.');
      return;
    }

    try {
      setLoading(true);
      const res = await changePassword(currentPassword, newPassword, confirmPassword);
      if (res.success) {
        if (onSuccess) onSuccess(res.message || 'Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl w-full max-w-md border border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Lock className="w-5 h-5 text-amber-500" />
            <span>Change Account Password</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password *</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">New Password *</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Password Strength Checklist */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
            <p className="font-semibold text-slate-300 mb-1">Password Requirements:</p>
            {rules.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px]">
                {rule.valid ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
                <span className={rule.valid ? 'text-emerald-300 font-medium' : 'text-slate-500'}>
                  {rule.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !allRulesPassed}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
