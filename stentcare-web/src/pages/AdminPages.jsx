import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { initialPatients } from '../utils/mockData';
import { Table, ValidatedInput, Button } from '../components/UIComponents';
import { Search, UserCheck, ShieldCheck, UserX, UserMinus, Download, TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';

import { apiFetch } from '../utils/api';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    activeStents: 0,
    hospitals: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/admin/dashboard/');
        if (data && data.data && data.data.stats) {
          const s = data.data.stats;
          setStats({
            doctors: s.total_doctors,
            patients: s.total_patients,
            activeStents: s.active_stents,
            hospitals: s.total_hospitals,
            pendingApprovals: s.pending_approvals
          });
        }
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  
  return (
    <Layout title="Admin Dashboard">
      <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col gap-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">System Infrastructure</h3>
            <p className="text-slate-400 font-bold mt-1">Global management of StentCare nodes and healthcare professionals.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Master Node: Online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
               <ShieldCheck size={24} />
             </div>
             <p className="text-4xl font-black text-slate-800">{loading ? '...' : stats.doctors}</p>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Doctors</p>
          </div>
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
             <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
               <Users size={24} />
             </div>
             <p className="text-4xl font-black text-slate-800">{loading ? '...' : stats.patients}</p>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Patients</p>
          </div>
          <div className="bg-white p-6 rounded-[24px) shadow-sm border border-slate-100">
             <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center mb-4">
               <Activity size={24} />
             </div>
             <p className="text-4xl font-black text-slate-800">{loading ? '...' : stats.activeStents}</p>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Active Stents</p>
          </div>
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
             <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
               <ShieldCheck size={24} />
             </div>
             <p className="text-4xl font-black text-slate-800">{loading ? '...' : stats.pendingApprovals}</p>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Pending Approvals</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const AdminDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/admin/users/?role=doctor');
      if (data && data.data && data.data.users) {
        setDoctors(data.data.users);
      }
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id) => {
    setDoctors(prev => prev.map(d => 
      d.id === id ? { ...d, status: d.status === 'approved' ? 'pending' : 'approved' } : d
    ));
  };

  return (
    <Layout title="Manage Doctors">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">Registered Doctors</h3>
            <p className="text-slate-400 font-bold mt-1">Approve and manage doctor accounts across the StentCare platform.</p>
          </div>
          <div className="relative w-full md:w-72">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
             <input type="text" placeholder="Search doctors..." className="w-full bg-white border border-slate-200 py-3 pl-12 pr-4 rounded-xl text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        
        <Table 
          headers={['Doctor Info', 'Contact Details', 'Specialty', 'Status', 'Account Actions']}
          data={filteredDoctors}
          renderRow={(d) => (
            <tr key={d.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-black flex items-center justify-center">
                     {(d.full_name || 'D').charAt(0)}
                   </div>
                   <div>
                     <p className="font-bold text-slate-800">{d.full_name}</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Joined: {new Date(d.created_at).toLocaleDateString()}</p>
                   </div>
                </div>
              </td>
              <td className="px-6 py-4">
                 <p className="text-sm font-semibold text-slate-600">{d.email}</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{d.phone}</p>
              </td>
              <td className="px-6 py-4 text-sm font-bold text-slate-600">{d.specialty}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${d.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-warning/20 text-warning'}`}>
                  {d.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <Button 
                   variant={d.status === 'approved' ? 'secondary' : 'primary'} 
                   className="!px-3 !py-1.5 !text-xs gap-2"
                   onClick={() => toggleStatus(d.id)}
                >
                  {d.status === 'approved' ? <><UserMinus size={14}/> Suspend Access</> : <><UserCheck size={14}/> Approve Online</>}
                </Button>
              </td>
            </tr>
          )}
        />
      </div>
    </Layout>
  );
};

export const AdminPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/admin/users/?role=patient');
      if (data && data.data && data.data.users) {
        setPatients(data.data.users);
      }
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p => 
    (p.full_name || '').toLowerCase().includes(search.toLowerCase()) || 
    (p.patient_id || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Manage Patients">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">System Patients</h3>
            <p className="text-slate-400 font-bold mt-1">View all centralized patient records completely isolated from active clinical states.</p>
          </div>
          <div className="relative w-full md:w-72">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
             <input type="text" placeholder="Search by name or Stent ID..." className="w-full bg-white border border-slate-200 py-3 pl-12 pr-4 rounded-xl text-sm font-bold outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        
        <Table 
          headers={['Patient Global ID', 'Vital Demographics', 'Active Stent Tracking Number', 'Stent Lifecycle Status']}
          data={filteredPatients}
          renderRow={(p) => (
            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                 <p className="font-black text-slate-800">{p.name}</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">UUID: pt_{p.id}93821</p>
              </td>
              <td className="px-6 py-4">
                 <p className="text-sm font-semibold text-slate-600">{p.age} Years Old</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{p.phone}</p>
              </td>
              <td className="px-6 py-4">
                 <span className="font-mono text-sm font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                   {p.stentId}
                 </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className={p.isRemoved ? 'text-slate-400' : 'text-green-500'} />
                  <span className={`text-[11px] font-black uppercase tracking-widest ${p.isRemoved ? 'text-slate-400' : 'text-green-600'}`}>
                    {p.isRemoved ? 'Archive / Removed' : 'Active Registry'}
                  </span>
                </div>
              </td>
            </tr>
          )}
        />
      </div>
    </Layout>
  );
};

export const AdminReportsPage = () => (
  <Layout title="System Reports">
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">Analytics & Reports</h3>
          <p className="text-slate-400 font-bold mt-1">System-wide operational metrics and global performance.</p>
        </div>
        <Button className="!px-6 shadow-primary/20 gap-2 shrink-0">
          <Download size={18} /> Export Full Report
        </Button>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col gap-4 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
           <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
             <BarChart3 size={24} />
           </div>
           <div>
             <p className="text-4xl font-black text-slate-800">85%</p>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Removal Compliance</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col gap-4 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
           <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center">
             <TrendingUp size={24} />
           </div>
           <div>
             <p className="text-4xl font-black text-slate-800">12.4%</p>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Growth vs Last Month</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col gap-4 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
           <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
             <Activity size={24} />
           </div>
           <div>
             <p className="text-4xl font-black text-slate-800">142</p>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Procedures (YTD)</p>
           </div>
        </div>
      </div>

      {/* Graphical Representation Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Line Chart Area */}
         <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl flex flex-col">
            <h4 className="text-xl font-black mb-2">Procedural Volume</h4>
            <p className="text-xs text-white/50 font-black uppercase tracking-widest mb-8">Insertions vs Removals over 6 Months</p>
            
            <div className="flex-1 flex items-end justify-between gap-2 h-48 mt-auto border-b border-white/10 pb-4">
               {/* Simulated Chart Bars */}
               {[40, 60, 45, 80, 50, 95].map((h, i) => (
                  <div key={i} className="w-full bg-white/5 rounded-t-lg relative group h-full flex items-end">
                     <div className="w-full bg-primary rounded-t-lg transition-all duration-500 hover:bg-primary-light" style={{ height: `${h}%` }}></div>
                  </div>
               ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-black uppercase tracking-wider text-white/40">
               <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
            </div>
         </div>

         {/* Distribution Chart Area */}
         <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col">
            <h4 className="text-xl font-black text-slate-800 mb-2">Patient Demographics</h4>
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-8">Age Distribution in System</p>
            
            <div className="flex-1 flex items-center justify-center">
               <div className="relative w-48 h-48 rounded-full border-[16px] border-slate-50 flex items-center justify-center">
                 {/* CSS Pie Chart simulation */}
                  <div className="absolute inset-0 rounded-full border-[16px] border-primary" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 50%)' }}></div>
                  <div className="absolute inset-0 rounded-full border-[16px] border-accent" style={{ clipPath: 'polygon(50% 50%, 0 50%, 0 0, 50% 0)' }}></div>
                  <div className="text-center">
                    <PieChart size={32} className="text-slate-300 mx-auto mb-2" />
                    <span className="text-2xl font-black text-slate-800">4</span>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Groups</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary shrink-0"></div><span className="text-xs font-bold text-slate-600">Adults (18-45)</span></div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-accent shrink-0"></div><span className="text-xs font-bold text-slate-600">Seniors (45-65)</span></div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-success shrink-0"></div><span className="text-xs font-bold text-slate-600">Elderly (65+)</span></div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-200 shrink-0"></div><span className="text-xs font-bold text-slate-600">Pediatric (0-17)</span></div>
            </div>
         </div>
      </div>
    </div>
  </Layout>
);

export const AdminNotificationsPage = () => (
  <Layout title="System Notifications">
    <div className="max-w-4xl mx-auto py-8">
      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Alerts</h3>
      <p className="text-slate-400 font-bold mt-1">System-level warnings and errors.</p>
    </div>
  </Layout>
);
