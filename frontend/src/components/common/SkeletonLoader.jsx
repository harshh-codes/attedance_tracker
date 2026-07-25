import React from 'react';

export function CardSkeleton() {
  return (
    <div className="glass-card p-4 rounded-2xl border border-slate-800 animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-3 bg-slate-800 rounded w-24"></div>
        <div className="w-9 h-9 bg-slate-800 rounded-xl"></div>
      </div>
      <div className="h-7 bg-slate-800 rounded w-16"></div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-slate-800/60">
      <td className="px-4 py-3"><div className="h-8 w-8 bg-slate-800 rounded-xl"></div></td>
      <td className="px-4 py-3"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
      <td className="px-4 py-3"><div className="h-4 bg-slate-800 rounded w-28"></div></td>
      <td className="px-4 py-3"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
      <td className="px-4 py-3"><div className="h-4 bg-slate-800 rounded w-16"></div></td>
      <td className="px-4 py-3 text-right"><div className="h-6 bg-slate-800 rounded w-12 ml-auto"></div></td>
    </tr>
  );
}
