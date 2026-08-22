import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const bgColors = {
    success: 'bg-emerald-950 text-emerald-200 border-emerald-800',
    error: 'bg-rose-950 text-rose-200 border-rose-800',
    info: 'bg-slate-900 text-slate-200 border-slate-700',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-amber-400" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-short max-w-sm">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl ${bgColors[type] || bgColors.info}`}>
        {icons[type] || icons.info}
        <span className="text-sm font-medium pr-2">{message}</span>
        <button onClick={onClose} className="opacity-70 hover:opacity-100 transition p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
