import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Activity, Calendar, Settings, LogOut, 
  Search, ShieldCheck, Mail, Phone, Users, Clock, Edit3, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  DashboardHeader, NotificationBell, ProfilePhoto, 
  SidebarItem, AboutSection, ProfileSection, AppHeader 
} from '../components/Shared';

export const StatCard = ({ label, value, icon: Icon, color = 'var(--primary)' }) => (
  <div className="card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
    <div style={{ 
      position: 'absolute', top: -10, right: -10, opacity: 0.1, 
      color: color, transform: 'rotate(15deg)' 
    }}>
      <Icon size={80} />
    </div>
    <h1 style={{ color: color, marginBottom: '8px', fontSize: '32px', fontWeight: 800 }}>{value}</h1>
    <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
  </div>
);

export const DashboardLayout = ({ children, role, userTitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab ] = useState('dashboard');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-gradient)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '300px', height: '100vh', padding: '40px 28px', 
        borderRight: '1px solid var(--border)', background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '56px' }}>
          <div style={{ padding: '10px', background: 'var(--primary)', borderRadius: '14px', color: 'white', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>
            <Activity size={26} />
          </div>
          <h2 style={{ color: 'var(--text-main)', fontWeight: 900, fontSize: '24px', letterSpacing: '-1.2px' }}>StentCare</h2>
        </div>
        
        <div style={{ flex: 1 }}>
          <SidebarItem icon={Activity} label="My Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Calendar} label="Schedule & Tasks" active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} />
          <SidebarItem icon={User} label="My Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <SidebarItem icon={Settings} label="System Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          <SidebarItem icon={Info} label="About System" active={activeTab === 'about'} onClick={() => setActiveTab('about')} />
        </div>
        
        <div style={{ marginTop: 'auto', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
          <SidebarItem icon={LogOut} label="Sign Out" onClick={handleLogout} />
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '48px 72px', overflowY: 'auto' }}>
        <header style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          marginBottom: '48px'
        }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.8px' }}>{userTitle} Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Monitoring health milestones for <b>StentCare</b></p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <NotificationBell />
            <div style={{ height: '36px', width: '1px', background: 'var(--border)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '15px', fontWeight: 700 }}>{user?.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>{user?.role}</p>
              </div>
              <ProfilePhoto src={user?.photo} size={48} editable={false} />
            </div>
          </div>
        </header>

        {activeTab === 'profile' ? (
          <div className="grid">
            <ProfileSection user={user} />
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ padding: '16px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' }}>
                  <Edit3 size={28} />
                </div>
                <h3>Edit My Profile</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Update your personal details, contact information, and age.</p>
                <button className="btn btn-primary" onClick={() => navigate('/edit-profile')} style={{ width: '100%', marginTop: 'auto' }}>
                  Open Editor
                </button>
              </div>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ padding: '16px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
                  <Lock size={28} />
                </div>
                <h3>Security Settings</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Update your account password and enhance security.</p>
                <button className="btn" onClick={() => navigate('/change-password')} style={{ width: '100%', marginTop: 'auto', border: '1px solid var(--border)' }}>
                  Change Password
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'about' ? (
          <AboutSection />
        ) : activeTab === 'schedule' ? (
          <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
            <Calendar size={48} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '16px' }} />
            <h3>Schedule & Tasks</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Your upcoming medical appointments and stent tracking tasks will appear here.</p>
          </div>
        ) : activeTab === 'settings' ? (
          <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
            <Settings size={48} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '16px' }} />
            <h3>Application Settings</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Configure your dashboard preferences and global notification settings.</p>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
};
