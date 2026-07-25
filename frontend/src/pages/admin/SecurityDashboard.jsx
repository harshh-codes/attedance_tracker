import React, { useState, useEffect } from 'react';
import { getSecurityDashboard, getHealthStatus } from '../../services/securityService';
import DashboardCard from '../../components/common/DashboardCard';
import { CardSkeleton, TableRowSkeleton } from '../../components/common/SkeletonLoader';
import {
  ShieldAlert, Lock, Users, Activity, CheckCircle2, AlertTriangle, RefreshCw, Server, Terminal, ShieldCheck
} from 'lucide-react';

export default function SecurityDashboard() {
  const [data, setData] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const [secRes, healthRes] = await Promise.all([
        getSecurityDashboard(),
        getHealthStatus()
      ]);

      if (secRes.success) {
        setData(secRes.data);
      }
      if (healthRes) {
        setHealth(healthRes);
      }
    } catch (err) {
      console.error('Failed to load security metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Security Command Center</h2>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise threat detection, account lockout policies, active user session management, and system health status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSecurityData}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Security Telemetry</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
          </>
        ) : (
          <>
            <DashboardCard
              title="Failed Logins Today"
              value={data?.failedLoginsToday || 0}
              icon={ShieldAlert}
              badgeColor="rose"
              subtext="Unsuccessful login attempts"
            />
            <DashboardCard
              title="Locked Accounts"
              value={data?.lockedAccountsCount || 0}
              icon={Lock}
              badgeColor="amber"
              subtext="Locked for 15 minutes (5 failed logins)"
            />
            <DashboardCard
              title="Active Sessions"
              value={data?.activeSessionsCount || 0}
              icon={Users}
              badgeColor="sky"
              subtext="Currently authenticated devices"
            />
            <DashboardCard
              title="System Status"
              value={health?.status === 'UP' ? 'HEALTHY' : 'DEGRADED'}
              icon={Activity}
              badgeColor="emerald"
              subtext={`Uptime: ${health?.uptimeSeconds || 0}s • Latency: ${health?.latencyMs || 0}ms`}
            />
          </>
        )}
      </div>

      {/* Health & Server Diagnostics */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Server className="w-4 h-4 text-emerald-500" />
            <span>Infrastructure Health & Memory Diagnostics</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
            Database: {health?.database || 'CONNECTED'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-semibold block">Node Version</span>
            <span className="text-white font-bold">{health?.system?.nodeVersion || 'v20.x'}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-semibold block">Memory RSS</span>
            <span className="text-emerald-400 font-bold">{health?.system?.memory?.rssMB || 0} MB</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-semibold block">Heap Used</span>
            <span className="text-amber-400 font-bold">{health?.system?.memory?.heapUsedMB || 0} MB</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-semibold block">API Version</span>
            <span className="text-sky-400 font-bold">{health?.version || '1.0.0'}</span>
          </div>
        </div>
      </div>

      {/* Login History Audit Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Terminal className="w-4 h-4 text-amber-500" />
            <span>Recent Authentication Attempts</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">Result</th>
                <th className="px-4 py-3.5">Failure Reason</th>
                <th className="px-4 py-3.5">IP Address</th>
                <th className="px-4 py-3.5">Device Info</th>
                <th className="px-4 py-3.5">Timestamp</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading ? (
                <>
                  <TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton />
                </>
              ) : data?.recentLoginHistory?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">
                    No authentication logs recorded yet.
                  </td>
                </tr>
              ) : (
                data?.recentLoginHistory?.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-white">{log.email}</td>

                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        log.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {log.success ? 'SUCCESS' : 'FAILED'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {log.failureReason || '—'}
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-300">{log.ipAddress || '127.0.0.1'}</td>

                    <td className="px-4 py-3 text-slate-400 text-[11px] max-w-[150px] truncate" title={log.deviceInfo}>
                      {log.deviceInfo || 'Browser'}
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
      </div>
    </div>
  );
}
