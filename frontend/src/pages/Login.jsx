import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Mail, AlertCircle, Loader2, ShieldCheck, Eye, EyeOff, UserPlus } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/employee/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const validateForm = () => {
    const errors = {};
    const email = formData.email.trim();
    if (!email) {
      errors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const loggedInUser = await login(formData.email.trim(), formData.password);
      
      // Redirect based on role
      if (loggedInUser.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/employee/dashboard', { replace: true });
      }
    } catch (err) {
      if (err.errors) {
        setFieldErrors(err.errors);
      }
      setServerError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 shadow-xl shadow-amber-500/20 mb-4">
            <Building2 className="w-9 h-9 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Landmark Developers
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Employee Attendance Tracking Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-2xl p-8 border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800/80">
            <div>
              <h2 className="text-lg font-bold text-white">Sign In to Your Account</h2>
              <p className="text-xs text-slate-400">Enter your official company credentials</p>
            </div>
            <ShieldCheck className="w-6 h-6 text-amber-500 shrink-0" />
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-300">Login Failed</p>
                <p className="text-xs text-rose-300/80 mt-0.5">{serverError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@landmarkdevelopers.com"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/90 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.email
                      ? 'border-rose-500 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-amber-500 focus:ring-amber-500/20'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className={`w-full pl-11 pr-11 py-3 rounded-xl bg-slate-900/90 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.password
                      ? 'border-rose-500 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-amber-500 focus:ring-amber-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Help */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500/30 focus:ring-offset-slate-950"
                />
                <span>Remember Me</span>
              </label>
              <Link to="/forgot-password" className="text-amber-400 font-semibold hover:underline">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authenticating Credentials...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>

            {/* Self-Registration Option */}
            <div className="pt-2 text-center text-xs text-slate-400">
              New employee?{' '}
              <Link to="/register" className="text-amber-400 font-semibold hover:underline inline-flex items-center gap-1">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Self-Register Here</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Demo Credentials Quick Guide */}
        <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
          <p className="font-semibold text-slate-300">🔑 Demo Credentials:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
              <span className="text-amber-400 font-bold">Admin:</span><br />
              admin@landmarkdevelopers.com<br />
              Pass: Admin@123
            </div>
            <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
              <span className="text-emerald-400 font-bold">Employee:</span><br />
              rajesh.sharma@landmarkdevelopers.com<br />
              Pass: Employee@123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
