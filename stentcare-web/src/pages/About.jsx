import React from 'react';
import { Layout } from '../components/Layout';
import { Activity, ShieldCheck, Heart, Users, CheckCircle } from 'lucide-react';

export const About = () => {
  return (
    <Layout title="About StentCare">
      <div className="max-w-4xl mx-auto py-12 px-6">
        
        {/* Hero Section */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-top-10 duration-700">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-[32px] text-primary mb-8 shadow-2xl shadow-primary/5">
            <Activity size={48} strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-black text-slate-800 tracking-tight leading-tight mb-8">
            Digital DJ Stent <br />
            <span className="text-primary italic">Tracking System</span>
          </h1>
          <p className="text-xl font-bold text-slate-500 leading-relaxed max-w-2xl mx-auto">
            StentCare is a healthcare solution designed to help doctors and patients track DJ stent insertion and removal dates efficiently. It improves patient safety, reduces missed removals, and provides timely alerts.
          </p>
        </div>

        {/* Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-24">
          <div className="card-base p-10 bg-gradient-to-br from-white to-primary/5 border-primary/10">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30 mb-6">
              <ShieldCheck size={28} />
            </div>
            <h4 className="text-2xl font-black text-slate-800 mb-4">Patient Safety First</h4>
            <p className="text-slate-500 font-bold leading-relaxed">
              Our core mission is to eliminate complications arising from forgotten DJ stents. By implementing automated tracking, we ensure every patient receives timely care.
            </p>
          </div>
          
          <div className="card-base p-10 bg-gradient-to-br from-white to-accent/5 border-accent/10">
             <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center text-white shadow-xl shadow-accent/30 mb-6">
              <Activity size={28} />
            </div>
            <h4 className="text-2xl font-black text-slate-800 mb-4">Real-time Monitoring</h4>
            <p className="text-slate-500 font-bold leading-relaxed">
              Doctors can oversee their entire patient load from a single dashboard, with intelligent alerts highlighting upcoming and overdue removal cases.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex flex-col md:flex-row items-center justify-around gap-12 p-12 bg-white rounded-[40px] border border-slate-100 shadow-sm mb-24">
          <div className="text-center">
            <p className="text-5xl font-black text-slate-800 mb-2 tracking-tighter">0%</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Missed Removals</p>
          </div>
          <div className="w-px h-12 bg-slate-100 hidden md:block"></div>
          <div className="text-center">
            <p className="text-5xl font-black text-slate-800 mb-2 tracking-tighter">1200+</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Tracked Stents</p>
          </div>
          <div className="w-px h-12 bg-slate-100 hidden md:block"></div>
          <div className="text-center">
            <p className="text-5xl font-black text-slate-800 mb-2 tracking-tighter">150+</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Active Doctors</p>
          </div>
        </div>

        {/* Feature List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Bell, label: 'Automated SMS Alerts' },
            { icon: Users, label: 'Role-Based Dashboards' },
            { icon: Heart, label: 'Patient Centric Focus' },
          ].map((feat, i) => (
            <div key={i} className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <feat.icon size={20} />
              </div>
              <span className="text-sm font-black text-slate-700 tracking-tight">{feat.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Built for precision in healthcare</p>
          <div className="flex items-center justify-center gap-3">
             <div className="px-5 py-2 bg-slate-50 rounded-full border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">Version 2.4.0</div>
             <div className="px-5 py-2 bg-slate-50 rounded-full border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">Cloud Enabled</div>
          </div>
        </div>

      </div>
    </Layout>
  );
};
