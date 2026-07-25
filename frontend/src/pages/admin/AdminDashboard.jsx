import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmployees } from '../../services/employeeService';
import { getTodaySummary } from '../../services/analyticsService';
import DashboardCard from '../../components/common/DashboardCard';
import ViewEmployeeModal from '../../components/admin/ViewEmployeeModal';
import { CardSkeleton, TableRowSkeleton } from '../../components/common/SkeletonLoader';
import { Users, UserCheck, UserX, Building2, CalendarCheck, Clock, TrendingUp, Eye, ArrowRight, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [recentEmployees, setRecentEmployees] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, departments: 0 });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [empRes, summaryRes] = await Promise.all([
        getEmployees({ page: 1, limit: 5, sortBy: 'newest' }),
        getTodaySummary()
      ]);

      if (empRes.success) {
        const empList = empRes.data || [];
        setRecentEmployees(empList);

        const total = empRes.pagination?.totalRecords || empList.length;
        const active = empList.filter(e => e.isActive).length;
        const inactive = empList.filter(e => !e.isActive).length;
        const depts = new Set(empList.map(e => e.department)).size;

        setStats({ total, active, inactive, departments: depts });
      }

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Executive HR Overview</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time system monitoring, staff analytics, and recent personnel registrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/reports')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold text-xs transition-all"
          >
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Reports & Analytics</span>
          </button>

          <button
            onClick={() => navigate('/admin/employees')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <span>Manage Employees</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Staff Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
          </>
        ) : (
          <>
            <DashboardCard
              title="Total Employees"
              value={stats.total}
              icon={Users}
              badgeColor="amber"
              subtext="Registered in company database"
            />
            <DashboardCard
              title="Active Personnel"
              value={stats.active}
              icon={UserCheck}
              badgeColor="emerald"
              subtext="Authorized for daily operations"
            />
            <DashboardCard
              title="Inactive Personnel"
              value={stats.inactive}
              icon={UserX}
              badgeColor="rose"
              subtext="Deactivated accounts"
            />
            <DashboardCard
              title="Departments"
              value={stats.departments}
              icon={Building2}
              badgeColor="sky"
              subtext="Active organizational units"
            />
          </>
        )}
      </div>

      {/* Live Today Attendance Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Shift Attendance</h3>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
            Live GPS Geofence Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <DashboardCard
            title="Present Today"
            value={summary?.presentToday || 0}
            icon={CalendarCheck}
            badgeColor="emerald"
            subtext={`Marked: ${summary?.employeesMarkedToday || 0}`}
          />
          <DashboardCard
            title="Absent Today"
            value={summary?.absentToday || 0}
            icon={UserX}
            badgeColor="rose"
            subtext={`Yet to mark: ${summary?.employeesYetToMarkToday || 0}`}
          />
          <DashboardCard
            title="Attendance Rate"
            value={`${summary?.attendancePercentageToday || 0}%`}
            icon={TrendingUp}
            badgeColor="amber"
            subtext="Today's workforce compliance"
          />
          <DashboardCard
            title="Avg Punch Time"
            value={summary?.averagePunchInTime || 'N/A'}
            icon={Clock}
            badgeColor="sky"
            subtext="Mean shift arrival timestamp"
          />
        </div>
      </div>

      {/* Recent Employees Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-white text-base">Recently Added Personnel</h3>
          </div>
          <button
            onClick={fetchDashboardData}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Employee ID</th>
                <th className="px-4 py-3.5">Name</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Designation</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Created Date</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading ? (
                <>
                  <TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton />
                </>
              ) : recentEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">
                    No recent employee records found.
                  </td>
                </tr>
              ) : (
                recentEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-amber-400">{emp.employeeId}</td>
                    <td className="px-4 py-3 font-bold text-white">{emp.firstName} {emp.lastName}</td>
                    <td className="px-4 py-3 text-slate-300">{emp.department}</td>
                    <td className="px-4 py-3 text-slate-400">{emp.designation}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        emp.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {emp.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">{new Date(emp.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setSelectedEmployee(emp); setIsViewOpen(true); }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Employee Detail Modal */}
      <ViewEmployeeModal
        isOpen={isViewOpen}
        onClose={() => { setIsViewOpen(false); setSelectedEmployee(null); }}
        employee={selectedEmployee}
      />
    </div>
  );
}
