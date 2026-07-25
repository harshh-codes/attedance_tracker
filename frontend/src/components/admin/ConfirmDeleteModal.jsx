import React from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

export default function ConfirmDeleteModal({ isOpen, onClose, employee, onConfirm, loading }) {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl w-full max-w-md border border-slate-800 shadow-2xl overflow-hidden text-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-white mb-1">Confirm Soft Deletion</h3>
          <p className="text-xs text-slate-400">
            Are you sure you want to soft-delete employee <span className="font-semibold text-rose-400">{employee.firstName} {employee.lastName}</span> ({employee.employeeId})?
          </p>
          <p className="text-[11px] text-slate-500 mt-2 italic">
            This will deactivate the employee account and exclude it from active directory lists without purging historical attendance records.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span>Soft Delete Employee</span>
          </button>
        </div>
      </div>
    </div>
  );
}
