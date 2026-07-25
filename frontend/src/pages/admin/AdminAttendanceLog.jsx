import React, { useState, useEffect, useCallback } from 'react';
import { getAdminAttendance } from '../../services/attendanceService';
import { CalendarCheck, Search, Filter, ShieldCheck, RefreshCw, ChevronLeft, ChevronRight, Globe, Monitor } from 'lucide-react';
import { TableRowSkeleton } from '../../components/common/SkeletonLoader';

export default function AdminAttendanceLog() {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalRecords: 0 });
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminAttendance({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        department: filterDepartment,
        status: filterStatus,
        date: filterDate
      });

      if (res.success) {
        setRecords(res.data || []);
        setPagination(res.pagination || { page: 1, limit: 10, totalPages: 1, totalRecords: 0 });
      }
    } catch (err) {
      console.error('Failed to load admin attendance log:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, filterDepartment, filterStatus, filterDate]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Company Attendance Log</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geofence punch-in verification records across all departments.
          </p>
        </div>

        <button
          onClick={fetchAttendance}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Search & Toolbar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Employee ID, Name, Department..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Picker */}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => { setFilterDate(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          />

          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={(e) => { setFilterDepartment(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Operations">Operations</option>
            <option value="Construction">Construction</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Finance">Finance</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="PRESENT">PRESENT</option>
            <option value="ABSENT">ABSENT</option>
            <option value="LATE">LATE</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Employee</th>
                <th className="px-4 py-3.5">ID</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Punch Time</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Distance</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Device & IP</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading ? (
                <>
                  <TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton />
                </>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-500">
                    No attendance records matching your criteria.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-white">
                      {rec.user ? `${rec.user.firstName} ${rec.user.lastName}` : 'N/A'}
                    </td>

                    <td className="px-4 py-3 font-mono font-semibold text-amber-400">
                      {rec.user?.employeeId || 'N/A'}
                    </td>

                    <td className="px-4 py-3 text-slate-300">
                      {rec.user?.department || 'N/A'}
                    </td>

                    <td className="px-4 py-3 text-slate-400">
                      {new Date(rec.attendanceDate).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3 font-mono text-emerald-400 font-bold">
                      {new Date(rec.punchInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {rec.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-300">
                      {rec.distanceFromOffice}m
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                    </td>

                    <td className="px-4 py-3 text-[11px] text-slate-400">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-slate-300">{rec.ipAddress || '127.0.0.1'}</span>
                        <span className="text-[10px] text-slate-500 truncate max-w-[140px]" title={rec.deviceInfo}>
                          {rec.deviceInfo ? rec.deviceInfo.slice(0, 25) + '...' : 'Browser'}
                        </span>
                      </div>
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
