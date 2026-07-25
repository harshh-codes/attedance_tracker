import React, { useState } from 'react';
import { X, Key, Loader2, AlertCircle } from 'lucide-react';
import { resetEmployeePassword } from '../../services/employeeService';

export default function ResetPasswordModal({ isOpen, onClose, employee, onSuccess }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !employee) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setServerError('');

    if (!newPassword) {
      setError('New password is required');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await resetEmployeePassword(employee.id, newPassword);
      onSuccess(`Password reset successfully for ${employee.firstName} ${employee.lastName}!`);
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl w-full max-w-md border border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Key className="w-5 h-5 text-amber-500" />
            <span>Reset Password</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            Resetting password for <span className="font-semibold text-amber-400">{employee.firstName} {employee.lastName}</span> ({employee.employeeId}).
          </div>

          {serverError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

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
            {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
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
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Reset Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
