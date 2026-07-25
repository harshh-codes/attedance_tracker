import React, { useState, useEffect } from 'react';
import { getOfficeSettings, updateOfficeSettings } from '../../services/systemService';
import { MapPin, Navigation, Clock, Globe, Save, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function OfficeSettings() {
  const [formData, setFormData] = useState({
    officeName: '',
    address: '',
    latitude: '',
    longitude: '',
    allowedRadius: '',
    workingHours: '',
    timezone: 'Asia/Kolkata',
    isActive: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchOffice = async () => {
    try {
      setLoading(true);
      const res = await getOfficeSettings();
      if (res.success && res.data?.office) {
        const off = res.data.office;
        setFormData({
          officeName: off.officeName || '',
          address: off.address || '',
          latitude: off.latitude || '',
          longitude: off.longitude || '',
          allowedRadius: off.allowedRadius || '',
          workingHours: off.workingHours || '09:00 AM - 06:00 PM',
          timezone: off.timezone || 'Asia/Kolkata',
          isActive: off.isActive !== undefined ? off.isActive : true
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load office settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffice();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errorMsg) setErrorMsg('');
    if (successMsg) setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const lat = parseFloat(formData.latitude);
    const lon = parseFloat(formData.longitude);
    const rad = parseFloat(formData.allowedRadius);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setErrorMsg('Latitude must be a valid number between -90 and 90');
      return;
    }

    if (isNaN(lon) || lon < -180 || lon > 180) {
      setErrorMsg('Longitude must be a valid number between -180 and 180');
      return;
    }

    if (isNaN(rad) || rad <= 0) {
      setErrorMsg('Allowed radius must be greater than 0 meters');
      return;
    }

    try {
      setSaving(true);
      const res = await updateOfficeSettings(formData);
      if (res.success) {
        setSuccessMsg(res.message || 'Office settings updated successfully!');
        fetchOffice();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update office settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Office Geofence & Location Settings</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure active office GPS coordinates, geofence radius, and working hours without altering code.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Active Geofence Engine
        </span>
      </div>

      <div className="glass-card rounded-2xl p-8 border border-slate-800 shadow-2xl">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <span className="text-xs font-medium">Loading office configuration...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Office Name *</label>
                <input
                  type="text"
                  name="officeName"
                  value={formData.officeName}
                  onChange={handleChange}
                  placeholder="Landmark Developers HQ"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Office Address *</label>
                <textarea
                  name="address"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Landmark Towers, Connaught Place, New Delhi, 110001"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Latitude Coordinate *</label>
                <div className="relative">
                  <Navigation className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="28.6139"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Longitude Coordinate *</label>
                <div className="relative">
                  <Navigation className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="77.2090"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Allowed Geofence Radius (Meters) *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="number"
                    step="any"
                    name="allowedRadius"
                    value={formData.allowedRadius}
                    onChange={handleChange}
                    placeholder="200"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono text-emerald-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Office Working Hours</label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleChange}
                    placeholder="09:00 AM - 06:00 PM"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Timezone</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    placeholder="Asia/Kolkata"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500/30"
                  />
                  <span>Active Office Location</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end pt-6 border-t border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Office Settings</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
