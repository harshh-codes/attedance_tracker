import React, { useState, useEffect } from 'react';
import {
  UserCheck, UserX, Clock, Mail, Phone, MapPin, Briefcase, Calendar, ShieldCheck, Search, RefreshCw, AlertCircle, CheckCircle2, X, Building2, Loader2
} from 'lucide-react';
import { getPendingRegistrations, approveRegistration, rejectRegistration } from '../../services/registrationService';

const DEPARTMENTS = [
  'Engineering',
  'Operations',
  'Construction',
  'Human Resources',
  'Finance',
  'IT & Infrastructure',
  'Sales & Marketing',
  'Project Management'
];

export default function PendingRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [serverMessage, setServerMessage] = useState({ type: '', text: '' });

  // Modals state
  const [selectedUser, setSelectedUser] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Approval form state
  const [approveForm, setApproveForm] = useState({
    department: 'Engineering',
    designation: '',
    employeeId: ''
  });
  const [submittingApprove, setSubmittingApprove] = useState(false);

  // Rejection form state
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setServerMessage({ type: '', text: '' });
      const res = await getPendingRegistrations();
      if (res.success && res.data) {
        setRegistrations(res.data);
      }
    } catch (err) {
      setServerMessage({ type: 'error', text: err.message || 'Failed to load pending registrations' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const openApproveModal = (user) => {
    setSelectedUser(user);
    setApproveForm({
      department: user.department || 'Engineering',
      designation: user.designation || '',
      employeeId: ''
    });
    setShowApproveModal(true);
  };

  const openRejectModal = (user) => {
    setSelectedUser(user);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!approveForm.department) {
      alert('Please select or enter a department');
      return;
    }

    try {
      setSubmittingApprove(true);
      const res = await approveRegistration(selectedUser.id, approveForm);
      if (res.success) {
        setServerMessage({ type: 'success', text: res.message || 'Employee registration approved successfully!' });
        setShowApproveModal(false);
        fetchRegistrations();
      }
    } catch (err) {
      alert(err.message || 'Failed to approve registration');
    } finally {
      setSubmittingApprove(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }

    try {
      setSubmittingReject(true);
      const res = await rejectRegistration(selectedUser.id, { rejectionReason });
      if (res.success) {
        setServerMessage({ type: 'success', text: res.message || 'Registration rejected.' });
        setShowRejectModal(false);
        fetchRegistrations();
      }
    } catch (err) {
      alert(err.message || 'Failed to reject registration');
    } finally {
      setSubmittingReject(false);
    }
  };

  const filteredUsers = registrations.filter((u) => {
    const query = searchTerm.toLowerCase();
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    return (
      fullName.includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.designation.toLowerCase().includes(query) ||
      (u.branch?.officeName || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>Registration Approvals</span>
          </div>
          <h1 className="text-xl font-bold text-white">Pending Employee Registrations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review self-registered applicants, verify credentials, assign departments, and approve login access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pending Queue</span>
            <span className="text-lg font-extrabold text-amber-400">{registrations.length}</span>
          </div>

          <button
            onClick={fetchRegistrations}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Global Alert Notification */}
      {serverMessage.text && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between ${
            serverMessage.type === 'error'
              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {serverMessage.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{serverMessage.text}</span>
          </div>
          <button onClick={() => setServerMessage({ type: '', text: '' })} className="hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search pending applicants by name, email, designation, or branch location..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 transition-all"
        />
      </div>

      {/* Applicant Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading pending registration requests...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
          <UserCheck className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Pending Registrations Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? 'No applicants match your search query.'
              : 'All self-registered employee applications have been reviewed.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 relative group"
            >
              <div className="space-y-3">
                {/* Header: Photo & Name */}
                <div className="flex items-start gap-3.5">
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.firstName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-sm shrink-0">
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-white truncate">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-xs text-amber-400 font-medium truncate flex items-center gap-1.5 mt-0.5">
                      <Briefcase className="w-3.5 h-3.5 shrink-0" />
                      <span>{user.designation}</span>
                    </p>
                  </div>
                </div>

                {/* Details List */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{user.phone || 'Phone not provided'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">Branch: {user.branch?.officeName || 'Default HQ'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Registered: {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">Email Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        user.isEmailVerified
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {user.isEmailVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                <button
                  onClick={() => openRejectModal(user)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-950 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 text-rose-400 text-xs font-semibold transition-all cursor-pointer"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>

                <button
                  onClick={() => openApproveModal(user)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/10 transition-all cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* APPROVE MODAL */}
      {showApproveModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <UserCheck className="w-5 h-5" />
                <span>Approve Employee Application</span>
              </div>
              <button
                onClick={() => setShowApproveModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <p>Applicant: <span className="font-bold text-white">{selectedUser.firstName} {selectedUser.lastName}</span> ({selectedUser.email})</p>
              <p className="text-slate-400">Branch: {selectedUser.branch?.officeName || 'Landmark HQ'}</p>
            </div>

            <form onSubmit={handleApproveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assign Department <span className="text-rose-400">*</span>
                </label>
                <select
                  value={approveForm.department}
                  onChange={(e) => setApproveForm({ ...approveForm, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-500"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Designation <span className="text-slate-500 text-[10px]">(Optional Update)</span>
                </label>
                <input
                  type="text"
                  value={approveForm.designation}
                  onChange={(e) => setApproveForm({ ...approveForm, designation: e.target.value })}
                  placeholder={selectedUser.designation}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Employee ID <span className="text-slate-500 text-[10px]">(Leave blank to auto-generate)</span>
                </label>
                <input
                  type="text"
                  value={approveForm.employeeId}
                  onChange={(e) => setApproveForm({ ...approveForm, employeeId: e.target.value })}
                  placeholder="e.g. EMP-106"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowApproveModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApprove}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2"
                >
                  {submittingApprove && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Approve & Activate Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <UserX className="w-5 h-5" />
                <span>Reject Registration Request</span>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Rejecting applicant <span className="font-bold text-white">{selectedUser.firstName} {selectedUser.lastName}</span> ({selectedUser.email}).
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rejection Reason <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide reason (e.g. Unverified branch details, invalid identification)..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReject}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 flex items-center gap-2"
                >
                  {submittingReject && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
