import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function Alert({ type = 'error', message }) {
  if (!message) return null;

  const config = {
    error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
    success: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  };

  const { icon: Icon, color, bg, border } = config[type] || config.info;

  return (
    <div className={`flex items-start gap-3 p-4 mb-6 rounded-xl border ${bg} ${border} ${color} animate-in fade-in zoom-in-95 duration-200`}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <span className="text-sm font-medium leading-relaxed">{message}</span>
    </div>
  );
}
