import React, { useState, useEffect, useCallback } from 'react';
import { getAuditLogs } from '../../services/systemService';
import { ShieldCheck, Search, Filter, RefreshCw, ChevronLeft, ChevronRight, User, Terminal } from 'lucide-react';
import { TableRowSkeleton } from '../../components/common/SkeletonLoader';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalRecords: 0 });
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAuditLogs({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        role: filterRole,
        action: filterAction,
        date: filterDate
      });

      if (res.success) {
        setLogs(res.data || []);
        setPagination(res.pagination || { page: 1, limit: 10, totalPages: 1, totalRecords: 0 });
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, filterRole, filterAction, filterDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">System Audit Directory</h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable system activity log recording logins, profile updates, password changes, and admin configuration changes.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by User Name, Employee ID, Action, Description..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => { setFilterDate(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          />

          <select
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="EMPLOYEE">EMPLOYEE</option>
          </select>

          <select
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Actions</option>
            <option value="PUNCH_IN">PUNCH_IN</option>
            <option value="PASSWORD_CHANGED">PASSWORD_CHANGED</option>
            <option value="PROFILE_UPDATED">PROFILE_UPDATED</option>
            <option value="EMPLOYEE_CREATED">EMPLOYEE_CREATED</option>
            <option value="EMPLOYEE_UPDATED">EMPLOYEE_UPDATED</option>
            <option value="OFFICE_SETTINGS_UPDATED">OFFICE_SETTINGS_UPDATED</option>
            <option value="COMPANY_SETTINGS_UPDATED">COMPANY_SETTINGS_UPDATED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">User Name</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-4 py-3.5">Description</th>
                <th className="px-4 py-3.5">IP Address</th>
                <th className="px-4 py-3.5">Timestamp</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading ? (
                <>
                  <TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton />
                </>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">
                    No audit log records matching your filter parameters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-white">
                      {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System / Unknown'}
                      {log.user?.employeeId && <span className="block text-[10px] font-mono text-slate-400">{log.user.employeeId}</span>}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        log.user?.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {log.user?.role || 'SYSTEM'}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-mono text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 text-[11px]">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-300 max-w-xs truncate" title={log.description}>
                      {log.description}
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
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
            Showing <span className="font-semibold text-white">{logs.length}</span> of <span className="font-semibold text-white">{pagination.totalRecords}</span> audit logs
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
