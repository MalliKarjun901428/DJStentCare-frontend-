import React from 'react';
import { 
  Activity, 
  Calendar, 
  Bell, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  ArrowRight,
  FileText,
  Users
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { StatCard, Button } from '../components/UIComponents';

export const PatientDashboard = () => {
  // Mock patient data
  const stentData = {
    id: 'ST-103',
    insertedDate: '2023-10-01',
    dueDate: '2023-12-15',
    status: 'safe',
    doctor: 'Dr. Smith'
  };

  const calculateDaysRemaining = (date) => {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysLeft = calculateDaysRemaining(stentData.dueDate);
  const isUrgent = daysLeft < 7 && daysLeft >= 0;
  const isOverdue = daysLeft < 0;

  return (
    <Layout title="My Stent Tracking">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h3 className="text-3xl font-black text-slate-800">Hello, Michael</h3>
            <p className="text-slate-400 font-bold mt-1">Here is your current stent status and upcoming milestones.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge-success !px-4 !py-2">Active Tracking</span>
          </div>
        </div>

        {/* Highlight Card: Days Remaining */}
        <div className={`card-base border-none relative overflow-hidden p-10 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl transition-all duration-700 ${
          isOverdue ? 'bg-danger text-white shadow-danger/20' : 
          isUrgent ? 'bg-warning text-white shadow-warning/20' : 
          'bg-primary text-white shadow-primary/20'
        }`}>
          <div className="relative z-10 text-center md:text-left">
            <p className="text-xs font-black uppercase tracking-[0.3em] opacity-60 mb-2">Time Until Removal</p>
            <h4 className="text-7xl font-black tracking-tighter tabular-nums mb-2">
              {isOverdue ? Math.abs(daysLeft) : daysLeft}
              <span className="text-2xl ml-2 opacity-60">{isOverdue ? 'Days Overdue' : 'Days Remaining'}</span>
            </h4>
            <div className="flex items-center gap-2 mt-6 justify-center md:justify-start">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              <p className="text-sm font-bold opacity-80 uppercase tracking-widest leading-none">Status: {isOverdue ? 'Overdue Action Required' : 'Safe Monitoring'}</p>
            </div>
          </div>
          
          <div className="relative z-10 flex flex-col gap-4 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-[24px] p-6 border border-white/20 min-w-[240px]">
              <div className="flex items-center justify-between mb-4">
                <ShieldCheck size={20} className="text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Verified Stent</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Stent Serial ID</p>
              <p className="text-2xl font-black font-mono tracking-wider">{stentData.id}</p>
            </div>
            
            <Button variant="secondary" className="!bg-white !text-slate-800 !py-4 shadow-xl shadow-black/5 hover:scale-[1.02]">
              <Calendar size={18} /> Reschedule Removal
            </Button>
          </div>

          {/* Abstract circle decor */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="card-base group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-800 leading-tight">Key Timelines</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Important Dates</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Inserted On</p>
                  <p className="text-sm font-bold text-slate-700">{stentData.insertedDate}</p>
                </div>
                <ArrowRight size={16} className="text-slate-200" />
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Due for Removal</p>
                  <p className="text-sm font-black text-primary">{stentData.dueDate}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-2xl border border-accent/10">
                <Bell size={18} className="text-accent" />
                <p className="text-xs font-bold text-accent-dark">Automated SMS and Email alerts are enabled for this tracking.</p>
              </div>
            </div>
          </div>

          <div className="card-base group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Users size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-800 leading-tight">Medical Provider</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Contact Information</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100/50 mb-4">
              <div className="w-14 h-14 rounded-full border-[3px] border-white shadow-sm overflow-hidden bg-white">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Doctor" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">{stentData.doctor}</p>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Senior Urologist</p>
              </div>
              <Button variant="secondary" className="ml-auto !p-2 rounded-xl !bg-white !shadow-sm">
                <Activity size={18} />
              </Button>
            </div>

            <button className="w-full py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em] hover:text-primary transition-colors flex items-center justify-center gap-2">
              <FileText size={14} /> Download Medical Summary
            </button>
          </div>

        </div>

        {/* Safety Note */}
        <div className="p-8 bg-white border border-slate-100 rounded-[32px] flex flex-col md:flex-row items-center gap-6 shadow-sm">
          <div className="w-14 h-14 shrink-0 rounded-2xl bg-danger-light/30 flex items-center justify-center text-danger">
            <AlertCircle size={28} />
          </div>
          <div>
            <h5 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Safety Instruction</h5>
            <p className="text-sm font-bold text-slate-500 leading-relaxed">
              If you experience severe pain, high fever, or significant blood in urine before your scheduled removal date, please contact your doctor immediately or visit the emergency department.
            </p>
          </div>
        </div>

      </div>
    </Layout>
  );
};
