import React, { useState, useEffect } from 'react';
import { X, Edit3, Loader2, AlertCircle } from 'lucide-react';
import { updateEmployee } from '../../services/employeeService';

export default function EditEmployeeModal({ isOpen, onClose, employee, onSuccess }) {
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
    designation: '',
    role: 'EMPLOYEE',
    profilePhoto: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        employeeId: employee.employeeId || '',
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        phone: employee.phone || '',
        department: employee.department || '',
        designation: employee.designation || '',
        role: employee.role || 'EMPLOYEE',
        profilePhoto: employee.profilePhoto || ''
      });
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await updateEmployee(employee.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        department: formData.department,
        designation: formData.designation,
        role: formData.role,
        profilePhoto: formData.profilePhoto
      });
      onSuccess('Employee details updated successfully!');
      onClose();
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      setServerError(err.message || 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card rounded-2xl w-full max-w-2xl border border-slate-800 shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Edit3 className="w-5 h-5 text-amber-500" />
            <span>Edit Employee Details</span>
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
              <label className="block text-xs font-semibold text-slate-400 mb-1">Employee ID (Read-only)</label>
              <input
                type="text"
                disabled
                value={formData.employeeId}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-400 cursor-not-allowed font-mono opacity-80"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
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
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              {errors.lastName && <p className="text-xs text-rose-400 mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
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
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              {errors.department && <p className="text-xs text-rose-400 mt-1">{errors.department}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Designation *</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              {errors.designation && <p className="text-xs text-rose-400 mt-1">{errors.designation}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Profile Photo URL</label>
            <input
              type="text"
              name="profilePhoto"
              value={formData.profilePhoto}
              onChange={handleChange}
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
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
