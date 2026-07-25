import React from 'react';
import { X, UserCheck, Key, Mail, Phone, Building, Briefcase, Shield, Calendar, Clock, CalendarCheck } from 'lucide-react';

export default function ViewEmployeeModal({ isOpen, onClose, employee }) {
  if (!isOpen || !employee) return null;

  const formattedDate = employee.createdAt
    ? new Date(employee.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card rounded-2xl w-full max-w-2xl border border-slate-800 shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <UserCheck className="w-5 h-5 text-amber-500" />
            <span>Employee Profile Overview</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            {employee.profilePhoto ? (
              <img
                src={employee.profilePhoto}
                alt={`${employee.firstName} ${employee.lastName}`}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/40"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-2xl">
                {employee.firstName?.[0]}{employee.lastName?.[0]}
              </div>
            )}

            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-bold text-white">{employee.firstName} {employee.lastName}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  employee.isActive
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                }`}>
                  {employee.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  {employee.role}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-300 mt-0.5">{employee.designation}</p>
              <p className="text-xs text-amber-400/80 font-medium">{employee.department} Department</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center gap-3">
              <Key className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Employee ID</span>
                <span className="font-mono text-sm font-semibold text-white">{employee.employeeId}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center gap-3">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Email Address</span>
                <span className="font-mono text-xs font-semibold text-white">{employee.email}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center gap-3">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Phone Contact</span>
                <span className="font-mono text-xs font-semibold text-white">{employee.phone || 'N/A'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center gap-3">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Date Joined</span>
                <span className="text-xs font-semibold text-white">{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Attendance Summary Placeholder */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-400 font-semibold text-xs mb-1">
              <CalendarCheck className="w-4 h-4" />
              <span>Attendance History Summary (Placeholder)</span>
            </div>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Geo-fenced punch-in records, monthly attendance percentages, and leave logs for this employee will display here in the Attendance module.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
}
