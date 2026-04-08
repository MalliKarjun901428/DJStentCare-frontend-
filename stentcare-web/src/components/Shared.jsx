import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft, Mail, Phone, Clock, Info, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AppHeader = ({ title }) => {
  const navigate = useNavigate();
  return (
    <div className="app-header">
      <button 
        onClick={() => navigate(-1)}
        className="back-btn"
        aria-label="Back"
      >
        <ArrowLeft size={24} />
      </button>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>{title}</h1>
    </div>
  );
};

export const ProfilePhoto = ({ src, size = 100, editable = true }) => {
  const [currentSrc, setCurrentSrc] = useState(src || 'https://www.w3schools.com/howto/img_avatar.png');
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setCurrentSrc(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div 
        className="profile-circle-container" 
        style={{ width: size, height: size }}
        onClick={() => editable && fileInputRef.current.click()}
      >
        <img 
          src={currentSrc} 
          alt="Profile" 
          className="profile-circle"
        />
        {editable && (
          <div className="overlay">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Camera size={20} style={{ marginBottom: '4px' }} />
              <span>TAP TO CHANGE</span>
            </div>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*" 
          onChange={handleImageChange}
        />
      </div>
      {!editable && <span style={{ fontSize: '14px', fontWeight: 600 }}>Profile Photo</span>}
    </div>
  );
};

export const NotificationBell = ({ count = 3 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = [
    { id: 1, text: 'Stent removal due in 2 days for Sarah Conner', type: 'warning' },
    { id: 2, text: 'Overdue removal alert: John Doe (Stent ID: ST-102)', type: 'error' },
    { id: 3, text: 'System update: New dashboard features available', type: 'info' }
  ];

  return (
    <div style={{ position: 'relative' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer', position: 'relative', padding: '8px' }}
      >
        <Bell size={24} color="var(--text-secondary)" />
        {count > 0 && (
          <span style={{
            position: 'absolute', top: 5, right: 5,
            background: 'var(--error)', color: 'white',
            borderRadius: '50%', width: 18, height: 18,
            fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid white', fontWeight: 'bold'
          }}>{count}</span>
        )}
      </div>
      
      {isOpen && (
        <div className="card" style={{
          position: 'absolute', top: '100%', right: 0,
          width: '300px', zIndex: 100, padding: '16px'
        }}>
          <h4 style={{ marginBottom: '12px' }}>Notifications</h4>
          {notifications.map(n => (
            <div key={n.id} style={{ 
              padding: '8px 0', borderBottom: '1px solid var(--border)',
              fontSize: '13px', color: 'var(--text-main)'
            }}>
              {n.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ValidatedInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  error, 
  type = "text",
  maxLength,
  prefix
}) => (
  <div className="input-group">
    {label && <label className="label">{label}</label>}
    <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {prefix && (
        <span style={{
          position: 'absolute', left: '16px', color: 'var(--text-secondary)',
          fontWeight: '700', fontSize: '15px'
        }}>{prefix}</span>
      )}
      <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        maxLength={maxLength}
        className={`input ${error ? 'error' : ''}`}
        style={{ paddingLeft: prefix ? '54px' : '16px' }}
      />
    </div>
    {error && <p className="error-text">{error}</p>}
  </div>
);

export const ProfileSection = ({ user }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '32px', padding: '40px' }}>
    <ProfilePhoto src={user?.photo} size={100} />
    <div style={{ flex: 1 }}>
      <h2 style={{ fontSize: '28px', marginBottom: '8px', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{user?.name || 'Dr. Smith'}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={18} /> {user?.email}
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Phone size={18} /> {user?.phone || '+91 98765 43210'}
        </p>
      </div>
    </div>
  </div>
);

export const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <div className={`nav-link ${active ? 'active' : ''}`} onClick={onClick} style={{ 
    display: 'flex', alignItems: 'center', padding: '14px 18px', borderRadius: '12px',
    cursor: 'pointer', transition: 'all 0.2s', marginBottom: '8px'
  }}>
    <Icon size={22} style={{ marginRight: '14px' }} />
    <span style={{ fontWeight: 600 }}>{label}</span>
  </div>
);

export const AboutSection = () => (
  <div className="card" style={{ 
    marginTop: '40px', 
    background: 'white',
    textAlign: 'center',
    padding: '48px'
  }}>
    <div style={{ 
      display: 'inline-flex', padding: '20px', borderRadius: '50%',
      background: 'rgba(37, 99, 235, 0.05)', color: 'var(--primary)', marginBottom: '32px'
    }}>
      <Info size={40} />
    </div>
    <h1 style={{ marginBottom: '24px', color: 'var(--primary)', fontSize: '32px', fontWeight: 800 }}>About StentCare</h1>
    <p style={{ 
      color: 'var(--text-main)', 
      fontSize: '18px', 
      lineHeight: '1.8',
      maxWidth: '800px',
      margin: '0 auto 24px'
    }}>
      <b>StentCare – Digital DJ Stent Tracking System</b> is a smart healthcare solution designed to help doctors 
      and patients manage DJ stent treatments efficiently. It enables tracking of stent insertion 
      and removal dates, sends timely reminders, and reduces the risk of missed or delayed stent removal. 
      The system improves patient safety, enhances communication, and provides real-time monitoring 
      for better healthcare outcomes.
    </p>
    <div style={{ 
      display: 'inline-block', padding: '8px 20px', borderRadius: '20px',
      background: 'var(--bg-light)', color: 'var(--text-secondary)', 
      fontSize: '14px', fontWeight: 700 
    }}>
      Version 1.0.0
    </div>
  </div>
);
