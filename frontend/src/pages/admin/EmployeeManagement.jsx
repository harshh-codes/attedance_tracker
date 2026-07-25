import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getEmployees,
  updateEmployeeStatus,
  deleteEmployee
} from '../../services/employeeService';
import {
  Users, UserCheck, UserX, Building2, Search, Filter, Plus, Eye, Edit3,
  Power, Key, Trash2, ChevronLeft, ChevronRight, RefreshCw, CheckCircle2, AlertCircle, LogOut
} from 'lucide-react';

import AddEmployeeModal from '../../components/admin/AddEmployeeModal';
import EditEmployeeModal from '../../components/admin/EditEmployeeModal';
import ViewEmployeeModal from '../../components/admin/ViewEmployeeModal';
import ResetPasswordModal from '../../components/admin/ResetPasswordModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';

export default function EmployeeManagement() {
  const { user, logout } = useAuth();

  // Employee Data & Pagination State
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalRecords: 0 });
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modals Control State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Status Action Processing
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Notification Toast State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Employees List
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getEmployees({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        department: filterDepartment,
        role: filterRole,
        status: filterStatus,
        sortBy
      });

      if (res.success) {
        setEmployees(res.data || []);
        setPagination(res.pagination || { page: 1, limit: 10, totalPages: 1, totalRecords: 0 });
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch employee list', 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, filterDepartment, filterRole, filterStatus, sortBy]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Handle Status Toggle
  const handleToggleStatus = async (emp) => {
    try {
      setStatusLoadingId(emp.id);
      const newStatus = !emp.isActive;
      await updateEmployeeStatus(emp.id, newStatus);
      showToast(`Employee ${emp.firstName} ${emp.lastName} is now ${newStatus ? 'ACTIVE' : 'INACTIVE'}`);
      fetchEmployees();
    } catch (err) {
      showToast(err.message || 'Failed to update employee status', 'error');
    } finally {
      setStatusLoadingId(null);
    }
  };

  // Handle Soft Delete
  const handleConfirmDelete = async () => {
    if (!selectedEmployee) return;
    try {
      setDeleteLoading(true);
      await deleteEmployee(selectedEmployee.id);
      showToast(`Employee ${selectedEmployee.employeeId} has been soft deleted.`);
      setIsDeleteOpen(false);
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (err) {
      showToast(err.message || 'Failed to delete employee', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Statistics Calculation
  const activeCount = employees.filter(e => e.isActive).length;
  const inactiveCount = employees.filter(e => !e.isActive).length;
  const departmentsCount = new Set(employees.map(e => e.department)).size;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 text-sm font-medium transition-all ${
          toast.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Corporate Navbar */}
      <header className="glass-nav px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
            <Building2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-white">Landmark Developers</h1>
            <p className="text-xs text-amber-400 font-medium">Employee Management Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400">Logged in as:</span>
            <span className="font-semibold text-amber-400">{user?.firstName} {user?.lastName}</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">{user?.role}</span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-rose-500/10 text-xs font-semibold text-rose-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Header & Primary Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Employee Directory</h2>
            <p className="text-xs text-slate-400 mt-1">
              Manage company personnel, departmental assignments, role permissions, and access status.
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Employee</span>
          </button>
        </div>

        {/* Executive Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Staff</p>
              <p className="text-2xl font-extrabold text-white mt-1">{pagination.totalRecords}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Active Personnel</p>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1">{activeCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Inactive Personnel</p>
              <p className="text-2xl font-extrabold text-rose-400 mt-1">{inactiveCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <UserX className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Departments</p>
              <p className="text-2xl font-extrabold text-sky-400 mt-1">{departmentsCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Control Toolbar: Search, Filters, Sorting */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Employee ID, Name, Email, Department, Designation..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Filters & Sorting Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Department Filter */}
            <select
              value={filterDepartment}
              onChange={(e) => {
                setFilterDepartment(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Operations">Operations</option>
              <option value="Construction">Construction</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
              <option value="IT & Infrastructure">IT & Infrastructure</option>
            </select>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Roles</option>
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-400 font-medium focus:outline-none focus:border-amber-500"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="name_asc">Sort: Name (A-Z)</option>
              <option value="name_desc">Sort: Name (Z-A)</option>
              <option value="department">Sort: Department</option>
              <option value="employeeid">Sort: Employee ID</option>
            </select>

            <button
              onClick={fetchEmployees}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Corporate Employee Data Table */}
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Employee</th>
                  <th className="px-4 py-3.5">ID</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Designation</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Joined</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-12 text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                      <span>Loading Employee Directory...</span>
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-12 text-slate-500">
                      No matching employee records found.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-900/40 transition-colors">
                      {/* Photo & Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {emp.profilePhoto ? (
                            <img
                              src={emp.profilePhoto}
                              alt={emp.firstName}
                              className="w-9 h-9 rounded-xl object-cover border border-amber-500/30 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                              {emp.firstName?.[0]}{emp.lastName?.[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white text-sm leading-tight">{emp.firstName} {emp.lastName}</p>
                            <p className="text-[11px] text-slate-400">{emp.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Employee ID */}
                      <td className="px-4 py-3 font-mono font-semibold text-slate-300">
                        {emp.employeeId}
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3 font-medium text-slate-300">
                        {emp.department}
                      </td>

                      {/* Designation */}
                      <td className="px-4 py-3 text-slate-400">
                        {emp.designation}
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {emp.phone || 'N/A'}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          emp.role === 'ADMIN'
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {emp.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          emp.isActive
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${emp.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                          {emp.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>

                      {/* Date Joined */}
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        {new Date(emp.createdAt).toLocaleDateString()}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View */}
                          <button
                            onClick={() => { setSelectedEmployee(emp); setIsViewOpen(true); }}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => { setSelectedEmployee(emp); setIsEditOpen(true); }}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400"
                            title="Edit Employee"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Activate / Deactivate Toggle */}
                          <button
                            onClick={() => handleToggleStatus(emp)}
                            disabled={statusLoadingId === emp.id}
                            className={`p-1.5 rounded-lg transition-colors ${
                              emp.isActive
                                ? 'hover:bg-rose-500/10 text-slate-400 hover:text-rose-400'
                                : 'hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400'
                            }`}
                            title={emp.isActive ? 'Deactivate Employee' : 'Activate Employee'}
                          >
                            <Power className={`w-4 h-4 ${statusLoadingId === emp.id ? 'animate-spin' : ''}`} />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => { setSelectedEmployee(emp); setIsResetOpen(true); }}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-sky-400"
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          {/* Soft Delete */}
                          <button
                            onClick={() => { setSelectedEmployee(emp); setIsDeleteOpen(true); }}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400"
                            title="Soft Delete Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls Footer */}
          <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing <span className="font-semibold text-white">{employees.length}</span> of <span className="font-semibold text-white">{pagination.totalRecords}</span> employees
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value, 10), page: 1 }))}
                  className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-white focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-2 font-mono">
                  Page <span className="text-white font-bold">{pagination.page}</span> of <span className="text-white font-bold">{pagination.totalPages}</span>
                </span>

                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Landmark Developers. Admin Employee Management Module.
      </footer>

      {/* Modals */}
      <AddEmployeeModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={(msg) => { showToast(msg); fetchEmployees(); }}
      />

      <EditEmployeeModal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedEmployee(null); }}
        employee={selectedEmployee}
        onSuccess={(msg) => { showToast(msg); fetchEmployees(); }}
      />

      <ViewEmployeeModal
        isOpen={isViewOpen}
        onClose={() => { setIsViewOpen(false); setSelectedEmployee(null); }}
        employee={selectedEmployee}
      />

      <ResetPasswordModal
        isOpen={isResetOpen}
        onClose={() => { setIsResetOpen(false); setSelectedEmployee(null); }}
        employee={selectedEmployee}
        onSuccess={(msg) => showToast(msg)}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedEmployee(null); }}
        employee={selectedEmployee}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
