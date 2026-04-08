import React, { useState } from 'react';
import { 
  Users, 
  Activity, 
  ShieldCheck, 
  AlertCircle, 
  Search, 
  Filter, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Database,
  Terminal,
  Cpu,
  BarChart3,
  FileText,
  TrendingUp,
  Calendar,
  Building2
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { StatCard, Table, Button } from '../components/UIComponents';
import { initialPatients } from '../utils/mockData';
import { apiFetch } from '../utils/api';
import { useEffect } from 'react';

export const AdminDashboard = () => {
  const [doctors, setDoctors] = useState([
    { id: 101, name: 'Dr. Gregory House', specialty: 'Infectious Disease', status: 'pending', joined: '2023-11-20' },
    { id: 102, name: 'Dr. Meredith Grey', specialty: 'General Surgery', status: 'approved', joined: '2023-10-15' },
    { id: 103, name: 'Dr. Shaun Murphy', specialty: 'Surgical Resident', status: 'pending', joined: '2023-11-22' },
    { id: 104, name: 'Dr. John Watson', specialty: 'Medical Examiner', status: 'approved', joined: '2023-09-01' }
  ]);

  const [patients] = useState(initialPatients);
  const [loading, setLoading] = useState(false);

  // Fetch real admin data
  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/admin/dashboard/');
        if (data) {
          if (data.doctors) setDoctors(data.doctors);
          // Sync other stats if provided by backend
        }
      } catch (err) {
        console.warn('Admin backend not reachable, using localized state:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  const stats = {
    doctors: doctors.length,
    patients: patients.length,
    activeStents: patients.filter(p => !p.isRemoved).length,
    pendingDoctors: doctors.filter(d => d.status === 'pending').length,
    totalRemovals: patients.filter(p => p.isRemoved).length,
    hospitals: 4 // Match user image "4 Hospitals"
  };

  const handleAction = (id, newStatus) => {
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  return (
    <Layout title="System Administration">
      <div className="flex flex-col gap-10">
        
        {/* System Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">System Infrastructure</h3>
            <p className="text-slate-400 font-bold mt-1">Global management of StentCare nodes and healthcare professionals.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-4 py-2 bg-accent/5 border border-accent/10 rounded-xl">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-ping"></div>
                <span className="text-[10px] font-black text-accent uppercase tracking-widest">Master Node: Online</span>
             </div>
          </div>
        </div>

        {/* Global Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Doctors" value={stats.doctors} icon={Users} color="var(--color-primary)" />
          <StatCard label="Total Patients" value={stats.patients} icon={Activity} color="var(--color-accent)" />
          <StatCard label="Active Stents" value={stats.activeStents} icon={BarChart3} color="var(--color-success)" />
          <StatCard label="Hospitals" value={stats.hospitals} icon={Building2} color="#a855f7" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Provider Management */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-primary rounded-full"></div>
                <h4 className="text-2xl font-black text-slate-800 tracking-tight">Access Control</h4>
              </div>
              <div className="flex items-center gap-2">
                <Search size={18} className="text-slate-300" />
                <Filter size={18} className="text-slate-300" />
              </div>
            </div>

            <Table 
              headers={['Healthcare Professional', 'Specialty', 'Status', 'Actions']}
              data={doctors}
              renderRow={(d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {d.name.charAt(4)}
                      </div>
                      <div>
                        <p className="font-black text-slate-700 leading-none">{d.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Joined: {d.joined}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-500">{d.specialty}</td>
                  <td className="px-8 py-5">
                    <span className={d.status === 'approved' ? 'badge-success' : 'badge-warning'}>{d.status}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      {d.status === 'pending' ? (
                        <>
                          <button onClick={() => handleAction(d.id, 'approved')} className="p-1.5 text-accent hover:bg-accent-light rounded-lg transition-all" title="Approve">
                            <CheckCircle size={20} />
                          </button>
                          <button onClick={() => handleAction(d.id, 'rejected')} className="p-1.5 text-danger hover:bg-danger-light rounded-lg transition-all" title="Reject">
                            <XCircle size={20} />
                          </button>
                        </>
                      ) : (
                        <button className="p-1.5 text-slate-300 hover:text-slate-500 rounded-lg transition-all">
                          <MoreVertical size={20} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            />
          </div>

          {/* System Performance */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="card-base bg-slate-900 border-none text-white shadow-2xl shadow-slate-900/10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-white/10 rounded-xl text-primary-light">
                  <Terminal size={20} />
                </div>
                <h4 className="text-xl font-black text-white">System Logs</h4>
              </div>

              <div className="space-y-4">
                {[
                  { tag: 'AUTH', msg: 'Admin session initiated', time: '1min ago' },
                  { tag: 'DB', msg: 'Postgres health check: 100%', time: '5min ago' },
                  { tag: 'API', msg: 'New patient registered: Sarah Conner', time: '12min ago' },
                  { tag: 'SYS', msg: 'Backup completed: dj_stent_main', time: '1hr ago' }
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 p-3 bg-white/5 rounded-xl border border-white/5 font-mono">
                    <div className="text-[10px] font-black text-primary px-1.5 py-0.5 rounded bg-white/5 h-fit">{log.tag}</div>
                    <div className="flex flex-col">
                      <p className="text-[11px] font-bold text-white/90 leading-snug">{log.msg}</p>
                      <p className="text-[9px] text-white/40 mt-1 uppercase font-bold">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                 <div className="p-3 bg-white/5 rounded-2xl flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                       <Cpu size={12} className="text-accent" />
                       <span className="text-[10px] font-black uppercase text-white/60">CPU Load</span>
                    </div>
                    <p className="text-lg font-black text-white leading-none">12.4%</p>
                 </div>
                 <div className="p-3 bg-white/5 rounded-2xl flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                       <Database size={12} className="text-primary" />
                       <span className="text-[10px] font-black uppercase text-white/60">Database</span>
                    </div>
                    <p className="text-lg font-black text-white leading-none">0.2ms</p>
                 </div>
              </div>
            </div>

            <div className="card-base group cursor-pointer hover:border-primary/20">
               <div className="flex items-center justify-between mb-4">
                 <AlertCircle size={24} className="text-warning group-hover:animate-bounce" />
                 <span className="badge-warning">Maintenance</span>
               </div>
               <h5 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Scheduled Update</h5>
               <p className="text-xs font-bold text-slate-400 leading-relaxed">System core upgrade scheduled for Sunday at 02:00 AM UTC.</p>
            </div>
          </div>

        </div>

        {/* ─── System Reports & Monitoring ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Global Patient Monitoring */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-accent rounded-full"></div>
                <h4 className="text-2xl font-black text-slate-800 tracking-tight">Patient Monitoring</h4>
              </div>
            </div>
            <Table 
              headers={['Patient', 'Stent ID', 'Status']}
              data={patients.slice(0, 5)}
              renderRow={(p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-all">
                  <td className="px-8 py-4">
                    <p className="font-bold text-slate-700">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{p.phone}</p>
                  </td>
                  <td className="px-8 py-4 text-sm font-mono font-bold text-slate-500">{p.stentId}</td>
                  <td className="px-8 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${p.isRemoved ? 'bg-slate-100 text-slate-400' : 'bg-green-100 text-green-600'}`}>
                      {p.isRemoved ? 'Removed' : 'Active'}
                    </span>
                  </td>
                </tr>
              )}
            />
          </div>

          {/* System Reports Section */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-2 h-8 bg-primary rounded-full"></div>
              <h4 className="text-2xl font-black text-slate-800 tracking-tight">Administrative Reports</h4>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-800">{stats.patients}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Insertions</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-800">{stats.totalRemovals}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Removals</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Monthly Statistics</p>
                <h4 className="text-xl font-black">Performance Report</h4>
                <p className="text-xs text-white/50 mt-1 font-medium">StentCare Global Infrastructure</p>
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center font-black text-2xl">
                 +82%
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};
