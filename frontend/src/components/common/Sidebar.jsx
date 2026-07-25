import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, UserCheck, CalendarCheck, FileBarChart, Settings, User, LogOut, Building2, Terminal, ShieldAlert, X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, role }) {
  const { logout } = useAuth();

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Pending Approvals', path: '/admin/pending-registrations', icon: UserCheck },
    { label: 'Employees', path: '/admin/employees', icon: Users },
    { label: 'Attendance Log', path: '/admin/attendance', icon: CalendarCheck },
    { label: 'Reports & Analytics', path: '/admin/reports', icon: FileBarChart },
    { label: 'Security Center', path: '/admin/security', icon: ShieldAlert },
    { label: 'Office Settings', path: '/admin/office-settings', icon: Settings },
    { label: 'Company Settings', path: '/admin/company-settings', icon: Building2 },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: Terminal },
    { label: 'My Profile', path: '/admin/profile', icon: User }
  ];

  const employeeNavItems = [
    { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { label: 'My Attendance', path: '/employee/attendance', icon: CalendarCheck },
    { label: 'My Profile', path: '/employee/profile', icon: User }
  ];

  const navItems = role === 'ADMIN' ? adminNavItems : employeeNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header Branding */}
          <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
                <Building2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-white leading-tight">Landmark Devs</h2>
                <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                  {role === 'ADMIN' ? 'Admin Portal' : 'Employee Portal'}
                </p>
              </div>
            </div>

            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0 text-amber-500/80" />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout Button */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold text-rose-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
}
