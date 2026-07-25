import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'No Data Found', description = 'There are no records matching your request.', actionButton = null }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center glass-card rounded-2xl border border-slate-800 my-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-4">{description}</p>
      {actionButton}
    </div>
  );
}
