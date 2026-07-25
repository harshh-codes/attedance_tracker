import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/systemService';
import ChangePasswordModal from '../../components/common/ChangePasswordModal';
import { UserCheck, Mail, Phone, Key, Calendar, Edit3, Lock, Save, Loader2, CheckCircle2, AlertCircle, Home, PhoneCall } from 'lucide-react';

export default function EmployeeProfile() {
  const { user, checkAuthStatus } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isPassOpen, setIsPassOpen] = useState(false);

  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    emergencyContact: user?.emergencyContact || '',
    address: user?.address || '',
    profilePhoto: user?.profilePhoto || ''
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateProfile(formData);
      if (res.success) {
        setMsg({ text: 'Profile updated successfully!', type: 'success' });
        setIsEditing(false);
        checkAuthStatus();
      }
    } catch (err) {
      setMsg({ text: err.message || 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {msg.text && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-3 ${
          msg.type === 'error' ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
        }`}>
          {msg.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="glass-card rounded-2xl p-8 border border-slate-800 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-800">
          {user?.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.firstName}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-xl shrink-0"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-3xl shadow-xl shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          )}

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-extrabold text-white">{user?.firstName} {user?.lastName}</h2>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                ACTIVE ACCOUNT
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-300 mt-1">{user?.designation}</p>
            <p className="text-xs text-emerald-400/80 font-medium">{user?.department} Department</p>
          </div>

          <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-xs font-semibold text-emerald-400 transition-all inline-flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>

            <button
              onClick={() => setIsPassOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-xs font-semibold text-slate-300 transition-all inline-flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Change Password</span>
            </button>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="mt-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phone Contact</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91-9876543210"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Emergency Contact Number</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="+91-9811122233"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Home Address</label>
                <textarea
                  rows="2"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter your current residential address"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Profile Photo URL</label>
                <input
                  type="text"
                  value={formData.profilePhoto}
                  onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Personal Profile</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <Key className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Employee ID</span>
                <span className="font-mono text-sm font-semibold text-white">{user?.employeeId}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Email Address</span>
                <span className="font-mono text-xs font-semibold text-white">{user?.email}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Phone Contact</span>
                <span className="font-mono text-xs font-semibold text-white">{user?.phone || 'N/A'}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Emergency Contact</span>
                <span className="font-mono text-xs font-semibold text-white">{user?.emergencyContact || 'N/A'}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 sm:col-span-2">
              <Home className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Residential Address</span>
                <span className="text-xs font-semibold text-white">{user?.address || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <ChangePasswordModal
        isOpen={isPassOpen}
        onClose={() => setIsPassOpen(false)}
        onSuccess={(text) => setMsg({ text, type: 'success' })}
      />
    </div>
  );
}
