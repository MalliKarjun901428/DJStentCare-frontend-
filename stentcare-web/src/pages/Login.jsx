import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  ShieldCheck, 
  ChevronRight, 
  Activity, 
  Mail, 
  Lock, 
  LogIn,
  ArrowLeft,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ValidatedInput, Button } from '../components/UIComponents';
import { apiFetch } from '../utils/api';

const RoleCard = ({ icon: Icon, title, desc, iconBg, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-5 p-5 mb-4 bg-white border border-slate-100/50 rounded-[28px] shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 active:scale-[0.98] transition-all group text-left"
  >
    <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-inner ${iconBg}`}>
      <Icon size={28} className="text-white" strokeWidth={2.5} />
    </div>
    <div className="flex-1">
      <h4 className="text-xl font-black text-slate-800 leading-none mb-1.5 tracking-tight">{title}</h4>
      <p className="text-sm font-bold text-slate-400 leading-tight">{desc}</p>
    </div>
    <ChevronRight size={20} className="text-slate-200 group-hover:text-primary transition-colors" />
  </button>
);

export const Login = () => {
  const [step, setStep] = useState('role'); // 'role' or 'creds'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('doctor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep('creds');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      try {
        // Attempt Real API Connection to Django
        const data = await apiFetch('/auth/login/', {
          method: 'POST',
          body: JSON.stringify({ email, password, role })
        });
        
        // If successful, pass the real token to our context
        const user = login(email, password, role);
        localStorage.setItem('stentcare_token', data.token); // Real token save
        if (user) navigate(`/${user.role}`);

      } catch (backendError) {
        // Fallback to offline mock mode if Django isn't running / connected yet
        console.warn('Backend connection failed, falling back to offline mode:', backendError);
        
        const user = login(email, password, role);
        if (user) {
          navigate(`/${user.role}`);
        } else {
          setError('Invalid login credentials.');
        }
      }
    } catch (err) {
      setError('Connection failed. Try later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-white overflow-hidden relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.02] rounded-full blur-[100px] -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/[0.02] rounded-full blur-[100px] -ml-48 -mb-48"></div>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        
        {step === 'role' ? (
          <>
            {/* Logo */}
            <div className="w-24 h-24 bg-primary/5 rounded-[40px] flex items-center justify-center mb-10 shadow-inner relative group">
              <div className="absolute inset-0 bg-primary/10 rounded-[40px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-14 h-14 border-[7px] border-primary rounded-full flex items-center justify-center overflow-hidden">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-6 bg-white"></div>
              </div>
            </div>

            <div className="text-center mb-12">
              <h1 className="text-4xl font-black text-[#1a2b4b] tracking-tight mb-3 italic">Welcome to StentCare</h1>
              <p className="text-lg font-bold text-slate-400">Select your role to continue</p>
            </div>

            <div className="w-full space-y-2">
              <RoleCard 
                icon={User} 
                title="Doctor" 
                desc="Manage patients and DJ stents" 
                iconBg="bg-[#3b82f6]"
                onClick={() => handleRoleSelect('doctor')}
              />
              <RoleCard 
                icon={Users} 
                title="Patient" 
                desc="Track your DJ stent status" 
                iconBg="bg-[#10b981]"
                onClick={() => handleRoleSelect('patient')}
              />
              <RoleCard 
                icon={ShieldCheck} 
                title="Admin" 
                desc="System administrator access" 
                iconBg="bg-[#f43f5e]"
                onClick={() => handleRoleSelect('admin')}
              />
            </div>

            <footer className="mt-20 text-center px-10">
               <p className="text-[13px] font-bold text-slate-300 leading-relaxed">
                 By continuing, you agree to our{' '}
                 <button className="text-slate-400 hover:text-primary underline decoration-slate-300 underline-offset-4">Terms of Service</button> and <button className="text-slate-400 hover:text-primary underline decoration-slate-300 underline-offset-4">Privacy Policy</button>
               </p>
            </footer>
          </>
        ) : (
          <div className="w-full animate-in fade-in slide-in-from-right-4 duration-500">
            <button 
              onClick={() => setStep('role')}
              className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-10 hover:text-primary transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Change Role
            </button>

            <div className="mb-10">
              <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-4 text-white ${
                role === 'doctor' ? 'bg-[#3b82f6]' : role === 'patient' ? 'bg-[#10b981]' : 'bg-[#f43f5e]'
              }`}>
                {role} Access
              </span>
              <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-none">Security Portal</h2>
              <p className="text-slate-400 font-bold mt-3">Enter your credentials to proceed.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <ValidatedInput 
                label="Identity Email"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="professional@hospital.com"
                required
              />
              <ValidatedInput 
                label="Security Key"
                type="password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />

              {error && (
                <div className="p-4 bg-danger-light/30 border border-danger/10 rounded-2xl flex items-center gap-3">
                   <ShieldCheck size={18} className="text-danger" />
                   <p className="text-sm font-bold text-danger italic">{error}</p>
                </div>
              )}

              <Button className="w-full !py-4.5 shadow-2xl shadow-primary/20 mt-4 group">
                {loading ? 'Authenticating...' : (
                  <>
                    Sign In
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center pt-10">
              <p className="text-sm font-bold text-slate-400">
                New to StentCare?{' '}
                <Link 
                  to="/signup" 
                  state={{ role }} 
                  className="text-primary hover:underline"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
