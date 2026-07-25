import React from 'react';

export default function DashboardCard({ title, value, icon: Icon, badgeText, badgeColor = 'amber', subtext, isPlaceholder = false }) {
  const colorMap = {
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    sky: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
    slate: 'bg-slate-800/50 border-slate-700/50 text-slate-400'
  };

  return (
    <div className={`glass-card p-5 rounded-2xl border transition-all ${isPlaceholder ? 'border-dashed border-slate-800/80 bg-slate-900/40' : 'border-slate-800'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${colorMap[badgeColor] || colorMap.amber}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-extrabold tracking-tight ${isPlaceholder ? 'text-slate-500' : 'text-white'}`}>
          {value}
        </span>
        {badgeText && (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colorMap[badgeColor]}`}>
            {badgeText}
          </span>
        )}
      </div>

      {subtext && (
        <p className="text-[11px] text-slate-500 mt-1.5 font-medium">{subtext}</p>
      )}
    </div>
  );
}
