import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  Calendar, 
  Bell, 
  FileText, 
  User, 
  Settings, 
  LogOut, 
  Search,
  ChevronLeft,
  Menu,
  MoreVertical,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const role = user?.role || 'patient';
  const navigate = useNavigate();

  const doctorMenu = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/doctor' },
    { label: 'Patients', icon: Users, path: '/doctor/patients' },
    { label: 'Stents', icon: Activity, path: '/doctor/stents' },
    { label: 'Appointments', icon: Calendar, path: '/doctor/appointments' },
    { label: 'Notifications', icon: Bell, path: '/doctor/notifications' },
    { label: 'Profile', icon: User, path: '/edit-profile' },
    { label: 'Settings', icon: Settings, path: '/doctor/settings' },
  ];

  const patientMenu = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/patient' },
    { label: 'My Stent Details', icon: Activity, path: '/patient/stents' },
    { label: 'Appointments', icon: Calendar, path: '/patient/appointments' },
    { label: 'Learn', icon: BookOpen, path: '/patient/learn' },
    { label: 'Emergency', icon: AlertCircle, path: '/patient/emergency' },
    { label: 'Notifications', icon: Bell, path: '/patient/notifications' },
    { label: 'Profile', icon: User, path: '/edit-profile' },
    { label: 'Settings', icon: Settings, path: '/patient/settings' },
  ];

  const adminMenu = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Manage Doctors', icon: Users, path: '/admin/doctors' },
    { label: 'Manage Patients', icon: Users, path: '/admin/patients' },
    { label: 'Reports', icon: FileText, path: '/admin/reports' },
    { label: 'Notifications', icon: Bell, path: '/admin/notifications' },
    { label: 'Profile', icon: User, path: '/edit-profile' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const filteredItems = role === 'doctor' ? doctorMenu : role === 'admin' ? adminMenu : patientMenu;

  return (
    <aside className="w-[260px] h-screen fixed left-0 top-0 bg-white border-r border-slate-100 flex flex-col z-50 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.02)]">
      <div className="p-8">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate(`/${role}`)}>
          <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30 transition-transform group-hover:scale-105 active:scale-95 group-hover:rotate-3">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-800 leading-none">StentCare</h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1 opacity-70">Healthcare</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-2 space-y-1 overflow-y-auto font-medium">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`sidebar-item relative ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <div className="absolute right-4 w-1.5 h-1.5 bg-current rounded-full shadow-sm animate-pulse opacity-50"></div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-50 mt-auto">
        <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100/50">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Logged In As</p>
          <p className="text-sm font-bold text-slate-700 truncate">{user?.name || 'Authorized User'}</p>
        </div>
        <button 
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-danger hover:bg-danger-light transition-all active:scale-[0.98]"
        >
          <LogOut size={18} strokeWidth={2.5} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export const Header = ({ title }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-100/60 fixed top-0 right-0 left-[260px] z-40 px-8 flex items-center justify-between transition-all duration-500">
      <div className="flex items-center gap-6">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 shadow-sm hover:border-primary/30 hover:text-primary rounded-xl transition-all active:scale-90"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-800">{title}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Active</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden xl:flex items-center group">
          <Search size={18} className="absolute left-4 text-slate-300 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search patients, stents..." 
            className="pl-12 pr-6 py-2.5 bg-slate-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none w-72 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all relative group ${
                showNotifications ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Bell size={20} strokeWidth={2.5} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-danger border-2 border-white rounded-full shadow-sm animate-bounce"></span>
            </button>
            
            {showNotifications && (
              <div className="absolute top-14 right-0 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="px-5 py-2 border-b border-slate-50 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Recent Alerts</span>
                  <span className="badge-error !py-0.5">3 New</span>
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  <div className="px-5 py-4 hover:bg-slate-50 border-l-4 border-danger transition-colors cursor-pointer">
                    <p className="text-xs font-black text-danger uppercase tracking-tighter">Overdue Alert</p>
                    <p className="text-sm font-bold text-slate-700 mt-1">John Doe's stent removal is overdue by 5 days.</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold">2 HOURS AGO</p>
                  </div>
                  <div className="px-5 py-4 hover:bg-slate-50 border-l-4 border-warning transition-colors cursor-pointer">
                    <p className="text-xs font-black text-warning uppercase tracking-tighter">Upcoming Removal</p>
                    <p className="text-sm font-bold text-slate-700 mt-1">Sarah Conner's removal due in 3 days.</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold">5 HOURS AGO</p>
                  </div>
                </div>
                <div className="px-5 pt-3 pb-1 text-center border-t border-slate-50">
                  <button 
                    onClick={() => {
                      setShowNotifications(false);
                      navigate(`/${user?.role}/notifications`);
                    }}
                    className="text-[11px] font-black text-primary uppercase tracking-widest hover:underline"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <Link to="/edit-profile" className="flex items-center gap-3 p-1 rounded-2xl transition-all group hover:bg-slate-50">
            <div className="w-11 h-11 rounded-xl border-2 border-white shadow-md overflow-hidden group-hover:scale-105 transition-transform">
              <img 
                src={user?.photo || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-black text-slate-800 leading-none">{user?.name || 'User'}</p>
              <p className="text-[10px] font-black text-primary uppercase mt-1.5 tracking-widest opacity-60">{user?.role || 'Patient'}</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export const Layout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-healthcare-surface flex">
      <Sidebar />
      <div className="flex-1 ml-[260px]">
        <Header title={title} />
        <main className="p-8 mt-20 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
