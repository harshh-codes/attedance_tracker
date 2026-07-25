import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

export default function EmployeeLayout({ children, pageTitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role="EMPLOYEE"
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={pageTitle}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
          {children || <Outlet />}
        </main>

        <footer className="border-t border-slate-800/80 px-6 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Landmark Developers. Employee Portal.
        </footer>
      </div>
    </div>
  );
}
