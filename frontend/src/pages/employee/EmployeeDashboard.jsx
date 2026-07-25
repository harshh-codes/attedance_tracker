import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTodayStatus, punchIn } from '../../services/attendanceService';
import {
  MapPin, Clock, CalendarCheck, CheckCircle2, AlertCircle, Loader2, Navigation, ShieldCheck
} from 'lucide-react';

export default function EmployeeDashboard() {
  const { user } = useAuth();

  // Live Digital Clock state
  const [time, setTime] = useState(new Date());

  // Attendance Status State
  const [todayStatus, setTodayStatus] = useState({ loading: true, hasPunched: false, record: null });
  const [punching, setPunching] = useState(false);
  const [punchingStatusText, setPunchingStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's attendance status
  const fetchStatus = async () => {
    try {
      setTodayStatus((prev) => ({ ...prev, loading: true }));
      const res = await getTodayStatus();
      if (res.success && res.data) {
        setTodayStatus({
          loading: false,
          hasPunched: res.data.hasPunched,
          record: res.data.attendance
        });
      }
    } catch (err) {
      console.error('Failed to fetch today status:', err);
      setTodayStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  });

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Handle Punch In Click & Browser Geolocation
  const handlePunchIn = () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser. Please use a modern browser.');
      return;
    }

    setPunching(true);
    setPunchingStatusText('Requesting GPS location permission...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          setPunchingStatusText('Verifying your coordinates against Landmark HQ Geofence...');
          const { latitude, longitude } = position.coords;
          const deviceInfo = `${navigator.userAgent}`;

          const res = await punchIn(latitude, longitude, deviceInfo);
          if (res.success && res.data) {
            setSuccessMsg(res.message || 'Attendance recorded successfully!');
            fetchStatus();
          }
        } catch (err) {
          setErrorMsg(err.message || 'Failed to record attendance. Please try again.');
        } finally {
          setPunching(false);
          setPunchingStatusText('');
        }
      },
      (geoError) => {
        setPunching(false);
        setPunchingStatusText('');
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setErrorMsg('Location permission denied. Please enable Location Services in your browser to mark attendance.');
            break;
          case geoError.POSITION_UNAVAILABLE:
            setErrorMsg('GPS location unavailable. Please check your device location settings and try again.');
            break;
          case geoError.TIMEOUT:
            setErrorMsg('Location request timed out. Please try again.');
            break;
          default:
            setErrorMsg('An error occurred while retrieving your location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-8">
      {/* Welcome Card & Live Clock Header */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user?.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.firstName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-2xl shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">Welcome back, {user?.firstName}!</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">{user?.designation} • {user?.department} Department</p>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">Employee ID: {user?.employeeId}</p>
          </div>
        </div>

        {/* Digital Clock Box */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center w-full md:w-auto">
          <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
            <Clock className="w-4 h-4 animate-spin text-emerald-500" />
            <span>LIVE SHIFT CLOCK</span>
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-extrabold text-white tracking-wider">{formattedTime}</p>
          <p className="text-xs text-slate-400 mt-0.5">{formattedDate}</p>
        </div>
      </div>

      {/* Geo-Fenced Punch In Terminal Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Geo-Fenced Attendance Terminal</h3>
              <p className="text-xs text-slate-400">Landmark Developers HQ (Allowed Radius: 200m)</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> GPS Geofence Active
          </span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-300">Attendance Punch-In Declined</p>
              <p className="text-xs text-rose-300/80 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-300">Punch-In Successful!</p>
              <p className="text-xs text-emerald-300/80 mt-0.5">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Status Display or Punch Button */}
        {todayStatus.loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <span className="text-xs font-medium">Checking today's attendance status...</span>
          </div>
        ) : todayStatus.hasPunched && todayStatus.record ? (
          /* Already Punched In Today Card */
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                ✔ PRESENT
              </span>
              <h4 className="text-xl font-bold text-white mt-2">Attendance Marked for Today</h4>
              <p className="text-xs text-slate-400 mt-1">You have successfully punched in for your daily shift.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-xs pt-2">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Punch Time</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {new Date(todayStatus.record.punchInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Location Verified</span>
                <span className="font-semibold text-emerald-400 text-sm flex items-center justify-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Yes
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Distance</span>
                <span className="font-mono font-bold text-white text-sm">
                  {todayStatus.record.distanceFromOffice} meters
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Punch In Button Area */
          <div className="flex flex-col items-center justify-center py-6 text-center">
            {punching ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="relative w-40 h-40 rounded-full border-4 border-amber-500/30 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
                  <Navigation className="w-12 h-12 text-amber-400 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-amber-400">{punchingStatusText}</p>
                  <p className="text-xs text-slate-400">Please do not close your browser window.</p>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={handlePunchIn}
                  className="w-48 h-48 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 flex flex-col items-center justify-center gap-2 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 active:scale-95 transition-all group cursor-pointer"
                >
                  <CalendarCheck className="w-12 h-12 stroke-[2.5] text-slate-950 group-hover:scale-110 transition-transform" />
                  <span className="font-extrabold text-lg tracking-wider">PUNCH IN</span>
                  <span className="text-[10px] font-bold text-slate-900/80 uppercase tracking-widest">Click to Record</span>
                </button>

                <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  Requires browser GPS location permission. Ensure you are inside office premises.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
