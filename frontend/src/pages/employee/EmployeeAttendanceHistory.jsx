import React, { useState, useEffect } from 'react';
import { getMyAttendance } from '../../services/attendanceService';
import { CalendarCheck, ShieldCheck, MapPin, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { TableRowSkeleton } from '../../components/common/SkeletonLoader';

export default function EmployeeAttendanceHistory() {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalRecords: 0 });
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getMyAttendance({ page: pagination.page, limit: pagination.limit });
      if (res.success) {
        setRecords(res.data || []);
        setPagination(res.pagination || { page: 1, limit: 10, totalPages: 1, totalRecords: 0 });
      }
    } catch (err) {
      console.error('Failed to load attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [pagination.page, pagination.limit]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">My Attendance Log</h2>
          <p className="text-xs text-slate-400 mt-1">Personal daily punch-in timestamps and geofence verification history.</p>
        </div>

        <button
          onClick={fetchHistory}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
          title="Refresh History"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Attendance Date</th>
                <th className="px-4 py-3.5">Punch Time</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Distance from Office</th>
                <th className="px-4 py-3.5">Location Verified</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading ? (
                <>
                  <TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton />
                </>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-500">
                    No attendance records found for your account.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">
                      {new Date(rec.attendanceDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="px-4 py-3 font-mono text-emerald-400 font-bold">
                      {new Date(rec.punchInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {rec.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-300">
                      {rec.distanceFromOffice} meters
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                        <ShieldCheck className="w-4 h-4" /> Verified
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{records.length}</span> of <span className="font-semibold text-white">{pagination.totalRecords}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-mono">Page {pagination.page} of {pagination.totalPages}</span>

            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
