import React, { useState } from 'react';
import { 
  Activity, Calendar, Bell, ShieldCheck, Clock, AlertCircle, ArrowRight, FileText, Users,
  Droplets, Pill, CheckCircle2, Thermometer, Plus, Check
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { StatCard, Button } from '../components/UIComponents';
import { useNavigate } from 'react-router-dom';

export const PatientDashboard = () => {
  const navigate = useNavigate();
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

  // Wellness Tracking States
  const [waterGlasses, setWaterGlasses] = useState(3); // 3 out of 8 target
  const [medsTaken, setMedsTaken] = useState({ flomax: false, painkiller: true });
  const [activeSymptoms, setActiveSymptoms] = useState([]);

  const toggleSymptom = (sym) => {
    setActiveSymptoms(prev => 
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const hasSevereSymptoms = activeSymptoms.includes('Fever') || activeSymptoms.includes('Blood in Urine');

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
            
            <Button variant="secondary" onClick={() => navigate('/patient/appointments')} className="!bg-white !text-slate-800 !py-4 shadow-xl shadow-black/5 hover:scale-[1.02]">
              <Calendar size={18} /> Reschedule Removal
            </Button>
          </div>

          {/* Abstract circle decor */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="card-base group cursor-pointer hover:shadow-xl transition-shadow" onClick={() => navigate('/patient/stents')}>
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
              <Button variant="secondary" onClick={() => alert("Forwarding connection request to Doctor...")} className="ml-auto !p-2 rounded-xl !bg-white !shadow-sm">
                <Activity size={18} />
              </Button>
            </div>

            <button onClick={() => alert("Compiling & Downloading Medical Summary PDF...")} className="w-full py-4 text-xs font-black text-slate-400 uppercase tracking-[0.2em] hover:text-primary transition-colors flex items-center justify-center gap-2">
              <FileText size={14} /> Download Medical Summary
            </button>
          </div>

        </div>

        {/* ─── Daily Wellness Tracker ─── */}
        <div className="pt-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Daily Wellness Tracker</h3>
          </div>

          <div className="flex flex-col gap-6">
            
            {/* Extended Hydration Tracker */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-blue-100 shadow-sm flex flex-col justify-between group relative overflow-hidden w-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                      <Droplets size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-800">Hydration Tracker</h4>
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{Math.round((waterGlasses/8)*100)}% of Daily Goal</span>
                    </div>
                  </div>
                  
                  <div className="flex items-end gap-6 my-8">
                    <div>
                       <p className="text-6xl font-black text-blue-600 leading-none tracking-tighter">{waterGlasses}<span className="text-3xl text-slate-300">/8</span></p>
                       <p className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] mt-2">Glasses logged today</p>
                    </div>
                    <button 
                      onClick={() => setWaterGlasses(prev => Math.min(prev + 1, 8))}
                      disabled={waterGlasses >= 8}
                      className="w-16 h-16 rounded-[1.5rem] bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                    >
                      {waterGlasses >= 8 ? <Check size={32} strokeWidth={3}/> : <Plus size={32} strokeWidth={3}/>}
                    </button>
                  </div>

                  <div className="bg-blue-50/60 rounded-2xl p-5 border border-blue-100/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
                    <p className="text-xs font-bold text-blue-800 flex flex-col gap-1.5 leading-relaxed">
                      <span className="font-black uppercase tracking-widest text-[10px] text-blue-500 flex items-center gap-1.5">
                        <Activity size={12} strokeWidth={3} /> Hydration Tip
                      </span>
                      "Drinking water prevents crystal formation around the stent. Try setting a timer every hour!"
                    </p>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="flex-1 flex flex-col gap-4 justify-center lg:border-l border-slate-100 lg:pl-8 pt-6 lg:pt-0 border-t lg:border-t-0">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between group/stat hover:bg-white hover:border-blue-100 hover:shadow-md transition-all">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Daily Target</p>
                      <p className="text-sm font-black text-slate-700">3 Liters (8 Glasses)</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover/stat:bg-blue-600 group-hover/stat:text-white transition-colors">
                      <Activity size={20} strokeWidth={2.5} />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between group/stat hover:bg-white hover:border-orange-100 hover:shadow-md transition-all">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Current Streak</p>
                      <p className="text-sm font-black text-slate-700">5 Days in a row 🔥</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center group-hover/stat:bg-orange-500 group-hover/stat:text-white transition-colors">
                      <CheckCircle2 size={20} strokeWidth={2.5} />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between group/stat hover:bg-white hover:border-emerald-100 hover:shadow-md transition-all">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Weekly Average</p>
                      <p className="text-sm font-black text-slate-700">7.2 Glasses / Day</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover/stat:bg-emerald-600 group-hover/stat:text-white transition-colors">
                      <Calendar size={20} strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Medication Checklist */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                     <Pill size={20} />
                   </div>
                   <h4 className="text-lg font-black text-slate-800">Medication</h4>
                </div>
  
                <div className="space-y-4">
                  <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-colors ${medsTaken.flomax ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}>
                     <div>
                       <p className={`font-bold text-sm ${medsTaken.flomax ? 'text-green-800' : 'text-slate-800'}`}>Tamsulosin (Flomax)</p>
                       <p className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${medsTaken.flomax ? 'text-green-600' : 'text-slate-400'}`}>0.4mg • 1x Daily</p>
                     </div>
                     <input type="checkbox" className="w-5 h-5 accent-green-600" checked={medsTaken.flomax} onChange={() => setMedsTaken(p => ({...p, flomax: !p.flomax}))} />
                  </label>
                  
                  <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-colors ${medsTaken.painkiller ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}>
                     <div>
                       <p className={`font-bold text-sm ${medsTaken.painkiller ? 'text-green-800' : 'text-slate-800'}`}>Ibuprofen</p>
                       <p className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${medsTaken.painkiller ? 'text-green-600' : 'text-slate-400'}`}>As needed for pain</p>
                     </div>
                     <input type="checkbox" className="w-5 h-5 accent-green-600" checked={medsTaken.painkiller} onChange={() => setMedsTaken(p => ({...p, painkiller: !p.painkiller}))} />
                  </label>
                </div>
              </div>
  
              {/* Symptom Logger */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                     <Thermometer size={20} />
                   </div>
                   <div>
                     <h4 className="text-lg font-black text-slate-800">Symptom Log</h4>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Tap what you feel today</p>
                   </div>
                </div>
  
                <div className="flex flex-wrap gap-2 mt-auto">
                  {['Mild Discomfort', 'Heavy Urge', 'Flank Pain', 'Fever', 'Blood in Urine'].map(sym => {
                    const isActive = activeSymptoms.includes(sym);
                    const isSevere = sym === 'Fever' || sym === 'Blood in Urine' || sym === 'Flank Pain';
                    return (
                      <button 
                        key={sym}
                        onClick={() => toggleSymptom(sym)}
                        className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                          isActive 
                           ? isSevere ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                           : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {sym}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Note */}
        {(hasSevereSymptoms || isUrgent || isOverdue) && (
          <div className="p-8 bg-white border border-danger/20 rounded-[32px] flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-danger/5 animate-in slide-in-from-bottom-4">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-danger-light/30 flex items-center justify-center text-danger animate-pulse">
              <AlertCircle size={28} />
            </div>
            <div>
              <h5 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Immediate Safety Warning</h5>
              <p className="text-sm font-bold text-slate-500 leading-relaxed">
                {hasSevereSymptoms 
                  ? "Based on the severe symptoms you logged (Fever/Blood), please contact your urologist immediately or proceed to urgent care."
                  : "If you experience severe pain, high fever, or significant blood in urine before your scheduled removal date, please contact your doctor immediately or visit the emergency department."
                }
              </p>
              {hasSevereSymptoms && (
                <button onClick={() => alert("Initiating emergency contact protocol...")} className="mt-4 px-5 py-2 bg-danger text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-danger-dark transition-colors">
                  Contact Doctor Now
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};
