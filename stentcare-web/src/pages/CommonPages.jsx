import React from 'react';
import { Layout } from '../components/Layout';
import { 
  Users, 
  Activity, 
  Calendar, 
  Bell, 
  FileText, 
  Settings,
  Construction,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

export const SettingsPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'patient';

  return (
    <Layout title="System Preferences">
      <div className="max-w-4xl mx-auto py-8">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-6">Account Settings</h3>

        <div className="flex flex-col gap-6">
          {/* Global Settings for all users */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="text-primary" size={20} />
              <h4 className="text-lg font-bold text-slate-800">Notification Preferences</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-700">Email Notifications</p>
                  <p className="text-xs text-slate-400 font-semibold">Receive updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-700">SMS Alerts</p>
                  <p className="text-xs text-slate-400 font-semibold">Get urgent updates via SMS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={role !== 'patient'} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Role specific settings */}
          {(role === 'admin' || role === 'doctor') && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="text-primary" size={20} />
                <h4 className="text-lg font-bold text-slate-800">Clinical Defaults</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-700">Default Stent Duration (Days)</p>
                    <p className="text-xs text-slate-400 font-semibold">Standard time before removal is due</p>
                  </div>
                  <input type="number" defaultValue={90} className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:border-primary" />
                </div>
                {role === 'admin' && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-700">System Maintenance Mode</p>
                      <p className="text-xs text-slate-400 font-semibold">Restrict access for non-admins</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-danger"></div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-primary" size={20} />
              <h4 className="text-lg font-bold text-slate-800">Privacy & Security</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-700">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-400 font-semibold">Enhance account security</p>
                </div>
                <button className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-sm font-bold transition-colors">
                  Enable 2FA
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-700">Data Sharing</p>
                  <p className="text-xs text-slate-400 font-semibold">Allow anonymized data for research</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </Layout>
  );
};
