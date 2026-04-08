import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  ArrowRight,
  ShieldEllipsis,
  Eye,
  EyeOff
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { ValidatedInput, Button } from '../components/UIComponents';
import { Link } from 'react-router-dom';

export const ChangePassword = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <Layout title="Security Credentials">
      <div className="max-w-4xl mx-auto py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Side: Illustration & Branding */}
          <div className="lg:col-span-5 flex flex-col gap-6">
             <div className="card-base bg-slate-900 border-none text-white p-12 overflow-hidden relative min-h-[400px] flex flex-col justify-between">
                <div className="relative z-10">
                   <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-primary-light mb-8 border border-white/5 backdrop-blur-sm">
                      <ShieldEllipsis size={32} />
                   </div>
                   <h3 className="text-3xl font-black text-white leading-tight mb-4">Protect Your Access.</h3>
                   <p className="text-slate-400 font-bold leading-relaxed">
                     Update your security key regularly to ensure professional patient data remains confidential.
                   </p>
                </div>

                <div className="relative z-10 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                   <div className="flex items-center gap-3 mb-3">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase text-accent tracking-[0.2em] leading-none">Security Active</span>
                   </div>
                   <p className="text-xs text-white/70 font-semibold leading-relaxed">
                     Passwords are encrypted using SHA-256 before storage in the Master Node.
                   </p>
                </div>

                {/* Abstract decor */}
                <div className="absolute top-[-20%] right-[-20%] w-80 h-80 bg-primary/20 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-60 h-60 bg-accent/10 rounded-full blur-[60px]"></div>
             </div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:col-span-7 flex flex-col gap-6">
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary rounded-full"></div>
                  <h4 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Update Security Key</h4>
                </div>
             </div>

             <div className="card-base p-10">
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                  
                  <div className="relative">
                    <ValidatedInput 
                      label="Current Security Key" 
                      type={showCurrent ? "text" : "password"} 
                      icon={Lock} 
                      placeholder="••••••••••••"
                      containerClassName="!mb-0"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-4 top-[38px] text-slate-300 hover:text-primary transition-colors"
                    >
                      {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="relative">
                      <ValidatedInput 
                        label="New Security Key" 
                        type={showNew ? "text" : "password"} 
                        icon={ShieldCheck} 
                        placeholder="••••••••••••"
                        containerClassName="!mb-0"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-4 top-[38px] text-slate-300 hover:text-primary transition-colors"
                      >
                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    <div className="relative">
                      <ValidatedInput 
                        label="Confirm New Security Key" 
                        type={showConfirm ? "text" : "password"} 
                        icon={ShieldCheck} 
                        placeholder="••••••••••••"
                        containerClassName="!mb-0"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-[38px] text-slate-300 hover:text-primary transition-colors"
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-8 flex flex-col gap-4">
                     <Button type="submit" className="w-full !py-4 shadow-2xl shadow-primary/20">
                        Update Key Identity
                        <ArrowRight size={18} strokeWidth={2.5} />
                     </Button>
                     <Link to="/edit-profile" className="text-center text-xs font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">
                        Return to Account Settings
                     </Link>
                  </div>

                </form>
             </div>

             <div className="card-base !p-6 bg-slate-50 border-slate-100 flex items-start gap-4 shadow-sm border-dashed">
                <div className="w-10 h-10 shrink-0 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-primary">
                   <Lock size={20} />
                </div>
                <div>
                   <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 leading-none">Requirements</h5>
                   <p className="text-xs font-bold text-slate-500 leading-relaxed">
                     Must be at least 12 characters long, contain one uppercase letter, one numerical digit and one specialized character (~!@#$%^).
                   </p>
                </div>
             </div>
          </div>

        </div>

      </div>
    </Layout>
  );
};
