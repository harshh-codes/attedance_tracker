import React, { useState, useEffect } from 'react';
import { getCompanySettings, updateCompanySettings } from '../../services/systemService';
import { Building2, Mail, Phone, Globe, Save, Loader2, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';

export default function CompanySettings() {
  const [formData, setFormData] = useState({
    companyName: '',
    companyLogo: '',
    companyEmail: '',
    companyPhone: '',
    website: '',
    supportEmail: '',
    timezone: 'Asia/Kolkata',
    defaultStartTime: '09:00 AM',
    defaultEndTime: '06:00 PM',
    companyAddress: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const res = await getCompanySettings();
      if (res.success && res.data?.company) {
        const comp = res.data.company;
        setFormData({
          companyName: comp.companyName || '',
          companyLogo: comp.companyLogo || '',
          companyEmail: comp.companyEmail || '',
          companyPhone: comp.companyPhone || '',
          website: comp.website || '',
          supportEmail: comp.supportEmail || '',
          timezone: comp.timezone || 'Asia/Kolkata',
          defaultStartTime: comp.defaultStartTime || '09:00 AM',
          defaultEndTime: comp.defaultEndTime || '06:00 PM',
          companyAddress: comp.companyAddress || ''
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load company settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
    if (successMsg) setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setSaving(true);
      const res = await updateCompanySettings(formData);
      if (res.success) {
        setSuccessMsg(res.message || 'Company settings updated successfully!');
        fetchCompany();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update company settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Corporate & Company Settings</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure official corporate branding, support channels, and default attendance parameters.
          </p>
        </div>
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
            <span className="text-xs font-medium">Loading corporate parameters...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Company Name *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Company Logo URL</label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="companyLogo"
                    value={formData.companyLogo}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Company Official Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    name="companyEmail"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Company Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="companyPhone"
                    value={formData.companyPhone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Website URL</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Support Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    name="supportEmail"
                    value={formData.supportEmail}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Default Shift Start Time</label>
                <input
                  type="text"
                  name="defaultStartTime"
                  value={formData.defaultStartTime}
                  onChange={handleChange}
                  placeholder="09:00 AM"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Default Shift End Time</label>
                <input
                  type="text"
                  name="defaultEndTime"
                  value={formData.defaultEndTime}
                  onChange={handleChange}
                  placeholder="06:00 PM"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Corporate Address</label>
                <textarea
                  name="companyAddress"
                  rows="2"
                  value={formData.companyAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end pt-6 border-t border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Company Settings</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
