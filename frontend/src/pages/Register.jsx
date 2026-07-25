import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2, User, Mail, Phone, Briefcase, MapPin, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Image, ShieldCheck, ArrowRight
} from 'lucide-react';
import { registerEmployee, getBranches, verifyEmailDev } from '../services/registrationService';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    designation: '',
    branchId: '',
    password: '',
    confirmPassword: '',
    profilePhoto: '',
    termsAccepted: false
  });

  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Registration success state
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const [verifyingDev, setVerifyingDev] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Fetch active office locations (branches) on mount
  useEffect(() => {
    async function fetchBranchList() {
      try {
        setLoadingBranches(true);
        const res = await getBranches();
        if (res.success && res.data) {
          setBranches(res.data);
          if (res.data.length > 0) {
            setFormData(prev => ({ ...prev, branchId: res.data[0].id }));
          }
        }
      } catch (err) {
        console.error('Failed to load office branches:', err);
      } finally {
        setLoadingBranches(false);
      }
    }
    fetchBranchList();
  }, []);

  // Password strength logic
  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2 || score === 3) return { score: 65, label: 'Medium', color: 'bg-amber-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  };

  const pwdStrength = calculatePasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';

    const email = formData.email.trim();
    if (!email) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.designation.trim()) errors.designation = 'Designation is required';
    if (!formData.branchId) errors.branchId = 'Please select your primary branch location';

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.termsAccepted) {
      errors.termsAccepted = 'You must accept Terms & Conditions to proceed';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        designation: formData.designation.trim(),
        branchId: formData.branchId,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        profilePhoto: formData.profilePhoto.trim() || undefined,
        termsAccepted: formData.termsAccepted
      };

      const res = await registerEmployee(payload);
      if (res.success) {
        setRegistrationSuccess(res.data);
      }
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDevInstantVerify = async () => {
    if (!registrationSuccess?.email) return;
    try {
      setVerifyingDev(true);
      const res = await verifyEmailDev(registrationSuccess.email);
      if (res.success) {
        setVerificationSuccess(true);
      }
    } catch (err) {
      alert(err.message || 'Failed to verify email');
    } finally {
      setVerifyingDev(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <Building2 className="w-7 h-7 stroke-[2.5]" />
          </div>
        </div>

        <h2 className="text-center text-2xl font-extrabold text-white tracking-tight">
          Landmark Developers
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400 font-medium">
          Employee Self-Registration Portal
        </p>

        <div className="mt-6 bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Registration Success Screen */}
          {registrationSuccess ? (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Registration Submitted!</h3>
                <p className="mt-2 text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you for registering, <span className="text-amber-400 font-semibold">{formData.firstName} {formData.lastName}</span>.
                  A verification link has been dispatched to <span className="text-white font-medium">{registrationSuccess.email}</span>.
                </p>
              </div>

              {!verificationSuccess ? (
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Email Verification Required</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Step 1 of 2: Verify your email address to proceed to Administrator Review.
                  </p>

                  <button
                    onClick={handleDevInstantVerify}
                    disabled={verifyingDev}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    {verifyingDev ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Email...</span>
                      </>
                    ) : (
                      <>
                        <span>Click Here to Verify Email (Instant Dev Mode)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 space-y-2">
                  <p className="text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Email Address Verified!</span>
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Your account is now <span className="font-bold text-amber-400">Pending Admin Approval</span>. Once an Administrator assigns your Department and activates your profile, you will be able to log in.
                  </p>
                </div>
              )}

              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-all"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {serverError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    First Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="e.g. Rajesh"
                      className={`w-full pl-9 pr-3 py-2 bg-slate-950 border ${
                        fieldErrors.firstName ? 'border-rose-500/80' : 'border-slate-800 focus:border-amber-500'
                      } rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-all`}
                    />
                  </div>
                  {fieldErrors.firstName && (
                    <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Last Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="e.g. Sharma"
                      className={`w-full pl-9 pr-3 py-2 bg-slate-950 border ${
                        fieldErrors.lastName ? 'border-rose-500/80' : 'border-slate-800 focus:border-amber-500'
                      } rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-all`}
                    />
                  </div>
                  {fieldErrors.lastName && (
                    <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. rajesh@landmark.com"
                      className={`w-full pl-9 pr-3 py-2 bg-slate-950 border ${
                        fieldErrors.email ? 'border-rose-500/80' : 'border-slate-800 focus:border-amber-500'
                      } rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-all`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number <span className="text-slate-500 text-[10px]">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91-9876543210"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Designation & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Designation <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      placeholder="e.g. Civil Site Engineer"
                      className={`w-full pl-9 pr-3 py-2 bg-slate-950 border ${
                        fieldErrors.designation ? 'border-rose-500/80' : 'border-slate-800 focus:border-amber-500'
                      } rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-all`}
                    />
                  </div>
                  {fieldErrors.designation && (
                    <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.designation}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Branch / Office Location <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <select
                      name="branchId"
                      value={formData.branchId}
                      onChange={handleChange}
                      disabled={loadingBranches}
                      className={`w-full pl-9 pr-3 py-2 bg-slate-950 border ${
                        fieldErrors.branchId ? 'border-rose-500/80' : 'border-slate-800 focus:border-amber-500'
                      } rounded-xl text-xs text-white outline-none transition-all appearance-none cursor-pointer`}
                    >
                      {loadingBranches ? (
                        <option value="">Loading branches...</option>
                      ) : (
                        branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.officeName}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  {fieldErrors.branchId && (
                    <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.branchId}</p>
                  )}
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 8 characters"
                      className={`w-full pl-9 pr-9 py-2 bg-slate-950 border ${
                        fieldErrors.password ? 'border-rose-500/80' : 'border-slate-800 focus:border-amber-500'
                      } rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password strength bar */}
                  {formData.password && (
                    <div className="mt-1.5 space-y-1">
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${pwdStrength.color} transition-all duration-300`}
                          style={{ width: `${pwdStrength.score}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 text-right">
                        Strength: <span className="font-semibold text-slate-200">{pwdStrength.label}</span>
                      </p>
                    </div>
                  )}
                  {fieldErrors.password && (
                    <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      className={`w-full pl-9 pr-9 py-2 bg-slate-950 border ${
                        fieldErrors.confirmPassword ? 'border-rose-500/80' : 'border-slate-800 focus:border-amber-500'
                      } rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Profile Photo (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Profile Photo URL <span className="text-slate-500 text-[10px]">(Optional)</span>
                </label>
                <div className="relative">
                  <Image className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="url"
                    name="profilePhoto"
                    value={formData.profilePhoto}
                    onChange={handleChange}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Terms Acceptance */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500/20"
                  />
                  <span className="text-xs text-slate-400 leading-snug">
                    I agree to the <span className="text-amber-400 underline">Terms of Service</span> and <span className="text-amber-400 underline">Privacy Policy</span> of Landmark Developers.
                  </span>
                </label>
                {fieldErrors.termsAccepted && (
                  <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.termsAccepted}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Self-Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Sign In Footer */}
              <p className="text-center text-xs text-slate-400 pt-2">
                Already registered?{' '}
                <Link to="/login" className="text-amber-400 font-semibold hover:underline">
                  Sign In to your account
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
