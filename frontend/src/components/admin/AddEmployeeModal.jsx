import React, { useState } from 'react';
import { X, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { createEmployee } from '../../services/employeeService';

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: '',
    role: 'EMPLOYEE',
    password: '',
    confirmPassword: '',
    profilePhoto: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(formData.email.trim())) newErrors.email = 'Invalid email address';
    }

    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const { confirmPassword, ...payload } = formData;
      await createEmployee(payload);
      onSuccess('Employee created successfully!');
      onClose();
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      setServerError(err.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card rounded-2xl w-full max-w-2xl border border-slate-800 shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <UserPlus className="w-5 h-5 text-amber-500" />
            <span>Add New Employee</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {serverError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Employee ID *</label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="EMP-106"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              {errors.employeeId && <p className="text-xs text-rose-400 mt-1">{errors.employeeId}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              {errors.firstName && <p className="text-xs text-rose-400 mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              {errors.lastName && <p className="text-xs text-rose-400 mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@landmarkdevelopers.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91-9876543210"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              {errors.phone && <p className="text-xs text-rose-400 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Department *</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Engineering / Construction / HR"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              {errors.department && <p className="text-xs text-rose-400 mt-1">{errors.department}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Designation *</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Civil Engineer / Manager"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              {errors.designation && <p className="text-xs text-rose-400 mt-1">{errors.designation}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              {errors.confirmPassword && <p className="text-xs text-rose-400 mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Profile Photo URL (Optional)</label>
            <input
              type="text"
              name="profilePhoto"
              value={formData.profilePhoto}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Save Employee</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
