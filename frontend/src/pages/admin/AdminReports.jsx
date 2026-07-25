import React, { useState, useEffect, useCallback } from 'react';
import { getAnalytics, downloadReport } from '../../services/analyticsService';
import DashboardCard from '../../components/common/DashboardCard';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import {
  BarChart3, PieChart, TrendingUp, Download, FileSpreadsheet, FileText, FileCode,
  Users, UserCheck, UserX, Clock, Building2, Calendar, Filter, RefreshCw
} from 'lucide-react';

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [reportType, setReportType] = useState('monthly'); // today, weekly, monthly, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [department, setDepartment] = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAnalytics({ type: reportType, startDate, endDate, department });
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [reportType, startDate, endDate, department]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleDownload = async (format) => {
    try {
      setExporting(true);
      await downloadReport(format, { type: reportType, startDate, endDate, department });
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const summary = data?.summary || {};
  const monthly = data?.monthlyAnalytics || {};
  const charts = data?.charts || {};

  return (
    <div className="space-y-8">
      {/* Header & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Attendance Analytics & Reports</h2>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise attendance intelligence, departmental metrics, and exportable compliance reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleDownload('excel')}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => handleDownload('csv')}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500/20 text-sky-400 text-xs font-bold transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => handleDownload('pdf')}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-xs font-bold transition-all"
          >
            <FileCode className="w-4 h-4" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Control Toolbar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-400" /> Filter Report:
          </span>

          <button
            onClick={() => setReportType('today')}
            className={`px-3 py-1.5 rounded-lg border font-semibold ${reportType === 'today' ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
          >
            Today
          </button>

          <button
            onClick={() => setReportType('weekly')}
            className={`px-3 py-1.5 rounded-lg border font-semibold ${reportType === 'weekly' ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
          >
            Weekly
          </button>

          <button
            onClick={() => setReportType('monthly')}
            className={`px-3 py-1.5 rounded-lg border font-semibold ${reportType === 'monthly' ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
          >
            Monthly
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Operations">Operations</option>
            <option value="Construction">Construction</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Finance">Finance</option>
          </select>

          <button
            onClick={fetchAnalytics}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {loading ? (
          <>
            <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
          </>
        ) : (
          <>
            <DashboardCard
              title="Present Today"
              value={summary.presentToday}
              icon={UserCheck}
              badgeColor="emerald"
              subtext={`Marked Attendance: ${summary.employeesMarkedToday}`}
            />
            <DashboardCard
              title="Absent Today"
              value={summary.absentToday}
              icon={UserX}
              badgeColor="rose"
              subtext={`Yet to mark: ${summary.employeesYetToMarkToday}`}
            />
            <DashboardCard
              title="Today's Attendance %"
              value={`${summary.attendancePercentageToday}%`}
              icon={TrendingUp}
              badgeColor="amber"
              subtext="Total workforce compliance"
            />
            <DashboardCard
              title="Average Punch Time"
              value={summary.averagePunchInTime}
              icon={Clock}
              badgeColor="sky"
              subtext="Mean shift arrival timestamp"
            />
          </>
        )}
      </div>

      {/* Monthly Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Monthly Attendance Rate</p>
            <p className="text-2xl font-extrabold text-white mt-1">{monthly.monthlyAttendancePercentage}%</p>
            <p className="text-[11px] text-emerald-400 mt-1">Target threshold: 85.0%</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Average Daily Attendance</p>
            <p className="text-2xl font-extrabold text-sky-400 mt-1">{monthly.averageDailyAttendance} Staff</p>
            <p className="text-[11px] text-slate-500 mt-1">Mean daily present headcount</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Most Active Department</p>
            <p className="text-xl font-extrabold text-amber-400 mt-1">{monthly.mostActiveDepartment}</p>
            <p className="text-[11px] text-slate-500 mt-1">Highest departmental attendance %</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Daily Attendance Trend Chart */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              <span>Last 7 Days Attendance Trend</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Headcount</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2">
            {charts.dailyTrend?.map((item, idx) => {
              const maxVal = Math.max(...charts.dailyTrend.map(d => d.present), 1);
              const heightPct = Math.max(15, Math.round((item.present / maxVal) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip Hover */}
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-amber-400 border border-slate-800 text-[10px] font-mono px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none">
                    {item.present} Present ({item.percentage}%)
                  </div>

                  <div className="w-full bg-slate-900 rounded-t-lg h-36 flex items-end p-1">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t transition-all group-hover:brightness-125"
                    ></div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Department-Wise Attendance Distribution */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Building2 className="w-4 h-4 text-emerald-500" />
              <span>Departmental Compliance (%)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Attendance Rate</span>
          </div>

          <div className="space-y-4">
            {charts.departmentDistribution?.map((dept, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">{dept.department}</span>
                  <span className="font-mono font-bold text-emerald-400">{dept.attendancePercentage}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    style={{ width: `${Math.min(100, dept.attendancePercentage)}%` }}
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
