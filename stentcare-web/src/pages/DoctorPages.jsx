import React, { useState } from 'react';
import { 
  Users, Activity, Calendar, Bell, Search, Filter, Download, MoreVertical, 
  UserPlus, Plus, CalendarCheck, Phone, CheckCircle, AlertCircle
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { initialPatients, initialAppointments, getStatusConfig, calcDays } from '../utils/mockData';

const StatusBadge = ({ status }) => {
  const c = getStatusConfig()[status] || getStatusConfig().safe;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
      {c.label}
    </span>
  );
};

/* ═══════════════════════════════════════════
    PATIENTS PAGE
═══════════════════════════════════════════ */
export const DoctorPatientsPage = () => {
  const [patients] = useState(initialPatients);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Layout title="Patient Directory">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">All Patients</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">Manage patient profiles and contact information.</p>
          </div>
          <button className="btn-primary !px-6 !py-2.5 text-sm">
            <UserPlus size={16} /> Add New Patient
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search patients..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-300 w-64" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100">
              <Download size={16} /> Export
            </button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {['Patient Name', 'Age', 'Mobile Number', 'Stent ID', 'Status', ''].map(h => (
                  <th key={h} className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPatients.map(p => (
                <tr key={p.id} className="hover:bg-blue-50/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">{p.name.charAt(0)}</div>
                      <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">{p.age} years</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600 flex items-center gap-1.5"><Phone size={14}/> {p.phone}</td>
                  <td className="px-6 py-4"><span className="font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded-lg">{p.stentId}</span></td>
                  <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                  <td className="px-6 py-4 text-right"><button className="p-2 text-slate-300 hover:text-blue-600 rounded-xl"><MoreVertical size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

/* ═══════════════════════════════════════════
    STENTS PAGE
═══════════════════════════════════════════ */
export const DoctorStentsPage = () => {
  const [patients] = useState(initialPatients);

  return (
    <Layout title="Stent Tracking">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Active Stents</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">Track inserted stents and removal deadlines.</p>
          </div>
          <button className="btn-primary bg-green-500 hover:bg-green-600 shadow-green-500/30 !px-6 !py-2.5 text-sm">
            <Plus size={16} /> Register Stent
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {['Stent ID', 'Patient Name', 'Inserted Date', 'Removal Date', 'Remaining', 'Status'].map(h => (
                  <th key={h} className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {patients.map(p => {
                const days = calcDays(p.removalDate);
                const isOverdue = days < 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4"><span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">{p.stentId}</span></td>
                    <td className="px-6 py-4 font-bold text-sm text-slate-800">{p.name}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-500">{p.insertedDate}</td>
                    <td className="px-6 py-4 font-bold text-sm text-slate-700">{p.removalDate}</td>
                    <td className="px-6 py-4">
                      {isOverdue ? <span className="text-sm font-black text-red-600">{Math.abs(days)}d overdue</span> : <span className="text-sm font-bold text-emerald-600">{days}d left</span>}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

/* ═══════════════════════════════════════════
    APPOINTMENTS PAGE
═══════════════════════════════════════════ */
export const DoctorAppointmentsPage = () => {
  const [appointments] = useState(initialAppointments);

  return (
    <Layout title="Appointments">
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Clinical Schedule</h3>
          <p className="text-xs font-semibold text-slate-400 mt-1">Upcoming patient visits and stent interventions.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {['Date', 'Time', 'Patient Name', 'Procedure Type', 'Status', ''].map(h => (
                  <th key={h} className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {appointments.map(a => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-bold text-slate-800 flex items-center gap-2"><Calendar size={14} className="text-blue-500" /> {a.date}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">{a.time}</td>
                  <td className="px-6 py-4 font-bold text-sm text-slate-800">{a.patientName}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">{a.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${a.status === 'Scheduled' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right"><button className="p-2 text-slate-300 hover:text-blue-600 rounded-xl"><MoreVertical size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

/* ═══════════════════════════════════════════
    NOTIFICATIONS PAGE
═══════════════════════════════════════════ */
export const DoctorNotificationsPage = () => {
  const alerts = [
    { id: 1, type: 'critical', title: 'Overdue Alert', message: 'Michael Scott is overdue for stent removal by 85 days.', time: '2 hours ago' },
    { id: 2, type: 'warning', title: 'Stent Removal Due', message: 'John Doe is due for stent removal in 4 days.', time: '5 hours ago' },
    { id: 3, type: 'info', title: 'System Update', message: 'The StentCare platform has been updated to version 2.1.', time: '1 day ago' },
  ];

  return (
    <Layout title="System Notifications">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Security & Alerts</h3>
        
        <div className="flex flex-col gap-3">
          {alerts.map(a => (
            <div key={a.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-all cursor-pointer">
              <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${
                a.type === 'critical' ? 'bg-red-50 text-red-500' : 
                a.type === 'warning' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
              }`}>
                {a.type === 'critical' ? <AlertCircle size={24} /> : a.type === 'warning' ? <Clock size={24} /> : <CheckCircle size={24} />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-black text-slate-800">{a.title}</h4>
                  <span className="text-xs font-bold text-slate-400">{a.time}</span>
                </div>
                <p className="text-sm font-semibold text-slate-500 mt-1">{a.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};
