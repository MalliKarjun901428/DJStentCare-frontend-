import React from 'react';
import { Layout } from '../components/Layout';
import { 
  Users, 
  Activity, 
  Calendar, 
  Bell, 
  FileText, 
  Settings,
  Construction 
} from 'lucide-react';

const PlaceholderView = ({ title, icon: Icon, description }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-24 h-24 bg-primary/10 text-primary rounded-[32px] flex items-center justify-center mb-8 animate-pulse">
      <Icon size={48} strokeWidth={1.5} />
    </div>
    <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-4">{title}</h3>
    <p className="text-slate-400 font-bold max-w-md mx-auto leading-relaxed">
      {description || "We're currently building this feature to provide you with the best healthcare experience. Stay tuned for updates!"}
    </p>
    <div className="mt-12 flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
      <Construction size={18} className="text-warning" />
      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Development in Progress</span>
    </div>
  </div>
);

export const PatientsPage = () => (
  <Layout title="Patient Directory">
    <PlaceholderView 
      title="Patient Management" 
      icon={Users} 
      description="Access and manage comprehensive patient profiles, medical history, and clinical records all in one secure portal."
    />
  </Layout>
);

export const StentsPage = () => (
  <Layout title="Digital Stent Inventory">
    <PlaceholderView 
      title="Stent Surveillance" 
      icon={Activity} 
      description="Monitor active DJ stents, track serial numbers, and manage inventory with real-time status updates."
    />
  </Layout>
);

export const AppointmentsPage = () => (
  <Layout title="Schedule & Appointments">
    <PlaceholderView 
      title="Healthcare Scheduling" 
      icon={Calendar} 
      description="Organize stent insertions, removals, and follow-up consultations with our intelligent scheduling system."
    />
  </Layout>
);

export const NotificationsPage = () => (
  <Layout title="Security Notifications">
    <PlaceholderView 
      title="System Alert Center" 
      icon={Bell} 
      description="Stay informed with real-time alerts regarding overdue removals, urgent patient status changes, and system updates."
    />
  </Layout>
);

export const ReportsPage = () => (
  <Layout title="Clinical Intelligence">
    <PlaceholderView 
      title="Analytics & Reports" 
      icon={FileText} 
      description="Generate comprehensive clinical reports, success rate analytics, and operational summaries for your practice."
    />
  </Layout>
);

export const SettingsPage = () => (
  <Layout title="System Preferences">
    <PlaceholderView 
      title="Portal Configuration" 
      icon={Settings} 
      description="Customize your StentCare experience, manage notification preferences, and configure clinical defaults."
    />
  </Layout>
);
