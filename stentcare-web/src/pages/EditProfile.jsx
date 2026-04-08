import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  ShieldCheck, 
  ArrowRight,
  LogOut,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { ValidatedInput, Button } from '../components/UIComponents';
import { useAuth } from '../context/AuthContext';
import { validatePhone, formatPhoneNumber } from '../utils/validation';
import { Link, useNavigate } from 'react-router-dom';

export const EditProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Michael Scott',
    email: user?.email || 'michael@scranton.com',
    phone: '9876543210'
  });
  const [phoneError, setPhoneError] = useState('');

  const handlePhoneChange = (val) => {
    const res = validatePhone(val);
    setProfileData(prev => ({ ...prev, phone: res.value }));
    setPhoneError(res.error);
  };

  return (
    <Layout title="Account Settings">
      <div className="max-w-4xl mx-auto py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Sidebar: Profile Summary */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="card-base text-center p-10 flex flex-col items-center group relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/10 to-accent/5"></div>
               
               <div className="relative mt-8 mb-6">
                 <div className="w-32 h-32 rounded-full border-[6px] border-white shadow-2xl overflow-hidden bg-slate-100 group-hover:scale-105 transition-transform duration-500">
                   <img 
                    src={user?.photo || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                   />
                 </div>
                 <button className="absolute bottom-1 right-1 w-10 h-10 bg-primary text-white rounded-xl border-4 border-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                   <Camera size={18} />
                 </button>
               </div>
               
               <div className="relative z-10 w-full">
                 <h4 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-2">{profileData.name}</h4>
                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-8">{user?.role || 'Healthcare Provider'}</p>
                 
                 <div className="flex border-t border-slate-50 pt-8 gap-3 w-full">
                    <Button variant="secondary" className="flex-1 !py-3 !rounded-xl !text-[11px] !font-black uppercase tracking-widest shadow-sm" onClick={() => { logout(); navigate('/login'); }}>
                      <LogOut size={16} /> Logout
                    </Button>
                 </div>
               </div>
            </div>

            <div className="card-base !p-4 border-primary/5 bg-primary/[0.02]">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-0.5 leading-none">Status</h5>
                    <p className="text-xs font-black text-slate-700 tracking-tight">Identity Verified</p>
                  </div>
                  <CheckCircle size={18} className="ml-auto text-accent" />
               </div>
            </div>
          </div>

          {/* Right Section: Edit Form */}
          <div className="lg:col-span-8 flex flex-col gap-6">
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary rounded-full"></div>
                  <h4 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Security Details</h4>
                </div>
                <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Private Access</div>
             </div>

             <div className="card-base p-10">
                <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ValidatedInput 
                      label="Professional Name" 
                      icon={User} 
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Michael Scott" 
                    />
                    <ValidatedInput 
                      label="Primary Contact Email" 
                      type="email" 
                      icon={Mail} 
                      value={profileData.email}
                      readOnly 
                      className="bg-slate-50 cursor-not-allowed border-slate-100 !text-slate-400"
                    />
                  </div>

                  <ValidatedInput 
                    label="Emergency Contact Number (+91)" 
                    icon={Phone} 
                    value={formatPhoneNumber(profileData.phone)}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    error={phoneError}
                    placeholder="98765 43210" 
                    numericOnly={true}
                    maxLength={11}
                  />

                  <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                     <div className="flex items-center gap-4 text-primary group cursor-pointer" onClick={() => navigate('/change-password')}>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <UserCheck size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black tracking-tight leading-none mb-1 group-hover:underline">Update Access Credentials</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Change Security Key</p>
                        </div>
                        <ChevronRight size={16} className="ml-2" />
                     </div>
                     
                     <Button 
                        type="submit" 
                        className="shadow-xl shadow-primary/20 !px-10"
                        disabled={!profileData.name || profileData.phone.length < 10 || !!phoneError}
                     >
                        Confirm Changes
                        <ArrowRight size={18} strokeWidth={2.5} />
                     </Button>
                  </div>
                </form>
             </div>

             <div className="flex items-center gap-3 p-6 bg-warning/5 rounded-[32px] border border-warning/10 border-dashed">
                <div className="w-10 h-10 shrink-0 bg-warning/20 text-warning rounded-2xl flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <p className="text-xs font-bold text-warning-dark leading-relaxed">
                  Encryption is active for all profile data. Your phone number is only visible to medical administrators for emergency contact.
                </p>
             </div>
          </div>

        </div>

      </div>
    </Layout>
  );
};
