import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, Bell, User, LogOut, ChevronDown, Shield, Home } from 'lucide-react';

export default function Navbar({ onToggleSidebar, pageTitle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute Breadcrumb trail
  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <header className="glass-nav sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between">
      {/* Left Section: Sidebar Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Home className="w-3.5 h-3.5" />
            <span>/</span>
            {pathSegments.map((seg, idx) => (
              <React.Fragment key={idx}>
                <span className="capitalize">{seg.replace('-', ' ')}</span>
                {idx < pathSegments.length - 1 && <span>/</span>}
              </React.Fragment>
            ))}
          </div>
          <h1 className="text-base font-bold text-white capitalize leading-tight">
            {pageTitle || pathSegments[pathSegments.length - 1]?.replace('-', ' ') || 'Dashboard'}
          </h1>
        </div>
      </div>

      {/* Right Section: Notifications & Profile Dropdown */}
      <div className="flex items-center gap-3">
        {/* Notifications Icon Placeholder */}
        <div className="relative">
          <button className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          </button>
        </div>

        {/* User Profile Menu Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
          >
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.firstName}
                className="w-8 h-8 rounded-lg object-cover border border-amber-500/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <div className="hidden sm:block text-left pr-1">
              <p className="text-xs font-bold text-white leading-tight">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-slate-400">{user?.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Content */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 glass-card rounded-2xl border border-slate-800 shadow-2xl py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="font-bold text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-slate-400 text-[11px] truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] font-bold uppercase">
                  {user?.role}
                </span>
              </div>

              <Link
                to={user?.role === 'ADMIN' ? '/admin/profile' : '/employee/profile'}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-900 text-slate-300 hover:text-white transition-colors"
              >
                <User className="w-4 h-4 text-amber-500" />
                <span>My Profile</span>
              </Link>

              <button
                onClick={() => { setMenuOpen(false); logout(); }}
                className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 hover:bg-rose-500/10 text-rose-400 transition-colors border-t border-slate-800/80"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
