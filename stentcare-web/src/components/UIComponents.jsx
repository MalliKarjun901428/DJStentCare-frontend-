import React, { useState } from 'react';
import { Activity, AlertCircle, Eye, EyeOff, ChevronDown, X } from 'lucide-react';

export const StatCard = ({ label, value, icon: Icon, color = 'var(--color-primary)', onClick }) => {
  return (
    <div 
      className={`card-base group overflow-hidden ${onClick ? 'cursor-pointer hover:-translate-y-1 transition-all' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="stat-label">{label}</p>
          <h3 className="stat-value group-hover:text-primary">{value}</h3>
        </div>
        <div 
          className="p-3.5 rounded-2xl shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg"
          style={{ backgroundColor: `${color}10`, color: color }}
        >
          <Icon size={26} strokeWidth={2.5} />
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 relative z-10">
        <span className="flex items-center gap-1 text-[11px] font-bold text-accent bg-accent-light px-2.5 py-1 rounded-lg border border-accent/10">
          <Activity size={12} />
          +12.5%
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">vs last month</span>
      </div>
      {/* Decorative gradient */}
      <div 
        className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] transition-all duration-700 group-hover:scale-150 group-hover:opacity-[0.08]" 
        style={{ backgroundColor: color }}
      ></div>
    </div>
  );
};

export const Table = ({ headers, data, renderRow }) => {
  return (
    <div className="card-base !p-0 overflow-hidden border-slate-100/80 shadow-xl shadow-slate-200/40">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100/50">
              {headers.map((h, i) => (
                <th key={i} className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50/50">
            {data.length > 0 ? (
              data.map((item, i) => renderRow(item, i))
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-8 py-16 text-center text-slate-400 font-medium italic">
                  No data points found to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ValidatedInput = ({ 
  label, 
  error, 
  icon: Icon, 
  className = '', 
  containerClassName = '', 
  type = 'text', 
  numericOnly = false,
  maxLength,
  onChange,
  onInput,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const handleInput = (e) => {
    if (numericOnly) {
      // Allow only digits and spaces for formatting
      e.target.value = e.target.value.replace(/[^\d\s]/g, '');
    }
    
    // Strictly enforce max length if provided
    if (maxLength && e.target.value.length > maxLength) {
      e.target.value = e.target.value.slice(0, maxLength);
    }

    if (onInput) onInput(e);
  };

  const handleChange = (e) => {
    if (numericOnly) {
      e.target.value = e.target.value.replace(/[^\d\s]/g, '');
    }
    if (maxLength && e.target.value.length > maxLength) {
      e.target.value = e.target.value.slice(0, maxLength);
    }
    if (onChange) onChange(e);
  };

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon 
            size={19} 
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${
              error ? 'text-danger' : 'text-slate-300 group-focus-within:text-primary'
            }`} 
          />
        )}
        <input
          {...props}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          onInput={handleInput}
          onChange={handleChange}
          maxLength={maxLength}
          className={`input-base ${Icon ? 'pl-12' : ''} ${isPassword ? 'pr-12' : ''} ${className} ${
            error ? 'border-danger/50 ring-4 ring-danger/5 bg-danger-light/20' : ''
          }`}
        />
        {isPassword && (
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="error-text flex items-center gap-1.5"><AlertCircle size={10} /> {error}</p>}
    </div>
  );
};

export const Select = ({ label, options, error, className = '', containerClassName = '', ...props }) => {
  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <select
          {...props}
          className={`input-base appearance-none cursor-pointer pr-10 focus:ring-4 focus:ring-primary/5 transition-all w-full ${className} ${
            error ? 'border-danger/50 bg-danger-light/20' : ''
          }`}
        >
          {options.map((opt, i) => (
            <option key={i} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-primary transition-all">
          <ChevronDown size={18} />
        </div>
      </div>
      {error && <p className="error-text flex items-center gap-1.5"><AlertCircle size={10} /> {error}</p>}
    </div>
  );
};

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 py-3 px-6 rounded-card font-bold active:scale-95 transition-all duration-200',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 py-3 px-6 rounded-card font-bold active:scale-95 transition-all duration-200',
  };

  return (
    <button 
      className={`${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Modal = ({ title, subtitle, icon: Icon, iconBg, iconColor, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/20 animate-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between p-8 border-b border-slate-100">
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 ${iconBg} ${iconColor} rounded-2xl flex items-center justify-center shadow-sm`}>
            <Icon size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all active:scale-90"
        >
          <X size={22} />
        </button>
      </div>
      <div className="p-8">{children}</div>
    </div>
  </div>
);
