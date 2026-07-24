import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-xl shadow-2xl transition-all animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === 'error'
              ? 'bg-red-950/90 border-red-500/40 text-red-200'
              : toast.type === 'warning'
              ? 'bg-amber-950/90 border-amber-500/40 text-amber-200'
              : toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-slate-900/95 border-slate-700/80 text-slate-200'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold leading-tight">{toast.title}</div>
            {toast.message && <div className="text-[11px] opacity-80 mt-0.5 leading-snug">{toast.message}</div>}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="shrink-0 p-1 hover:bg-white/10 rounded-lg transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
          </button>
        </div>
      ))}
    </div>
  );
}
