import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { PatientDashboard } from './PatientDashboard'; // Using the existing detailed one for the main dashboard
import { 
  Activity, Calendar, Clock, MapPin, User, FileText, 
  CheckCircle, AlertCircle, CalendarClock, Phone 
} from 'lucide-react';
import { Button, Modal } from '../components/UIComponents';

export { PatientDashboard }; // Re-export for App.jsx

export const PatientStentsPage = () => {
  const [selectedCard, setSelectedCard] = useState(null);

  const currentStents = [
    { id: 'ST-103', date: '2023-10-01', due: '2023-12-15', hospital: 'City General', doc: 'Dr. Smith', status: 'active' }
  ];
  
  const historicalStents = [
    { id: 'ST-089', date: '2022-04-12', removed: '2022-06-20', hospital: 'City General', doc: 'Dr. Adams', status: 'completed' },
    { id: 'ST-045', date: '2021-01-15', removed: '2021-03-30', hospital: 'Metro Health', doc: 'Dr. Smith', status: 'completed' }
  ];

  return (
    <Layout title="My Stent Details">
      <div className="max-w-4xl mx-auto py-8">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Stent Tracking</h3>
        <p className="text-slate-400 font-bold mt-1 mb-8">Detailed history and specifications of your active and past stents.</p>
        
        {/* Current Active Stent */}
        <h4 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-primary" /> Active Stent
        </h4>
        <div className="flex flex-col gap-4 mb-10">
          {currentStents.map(stent => (
            <div key={stent.id} className="bg-white p-6 rounded-[24px] shadow-sm border-2 border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10"></div>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full mb-3 inline-block">Safe Monitoring</span>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Serial ID</p>
                  <p className="text-2xl font-black font-mono text-slate-800">{stent.id}</p>
                </div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={12}/> Inserted On</p>
                    <p className="text-sm font-bold text-slate-700">{stent.date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><CalendarClock size={12}/> Due Date</p>
                    <p className="text-sm font-black text-primary">{stent.due}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><MapPin size={12}/> Hospital</p>
                    <p className="text-sm font-bold text-slate-700">{stent.hospital}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><User size={12}/> Inserted By</p>
                    <p className="text-sm font-bold text-slate-700">{stent.doc}</p>
                  </div>
                </div>
                <div>
                  <Button className="!px-6 shadow-primary/30" onClick={() => setSelectedCard(stent)}>View Card</Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Historical Stents */}
        <h4 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
          <Clock size={20} className="text-slate-400" /> Historical Records
        </h4>
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stent ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Insertion Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Removal Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {historicalStents.map(stent => (
                <tr key={stent.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-sm font-bold text-slate-600">{stent.id}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-500">{stent.date}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-500">{stent.removed}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-500">{stent.doc}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-100 rounded-lg">
                      <CheckCircle size={12} /> Successfully Removed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedCard && (
        <Modal 
          title="Digital Stent Card" 
          subtitle="Universal Implant Identifier" 
          icon={Activity} 
          iconBg="bg-blue-50" 
          iconColor="text-blue-600" 
          onClose={() => setSelectedCard(null)} 
        >
          <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[24px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4"></div>
            
            <div className="flex justify-between items-start relative z-10 mb-8">
              <div>
                <h4 className="text-white/80 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Patient</h4>
                <p className="text-xl font-black">Jane Doe</p> {/* Placeholder for presentation */}
              </div>
              <Activity className="text-white/30" size={32} />
            </div>

            <div className="space-y-6 relative z-10">
              <div>
                <h4 className="text-white/60 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Stent Serial Number</h4>
                <p className="text-3xl font-mono font-black tracking-wider">{selectedCard.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-white/60 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Inserted</h4>
                  <p className="font-bold text-sm">{selectedCard.date}</p>
                </div>
                <div>
                  <h4 className="text-white/60 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Due Removal</h4>
                  <p className="font-bold text-sm text-blue-200">{selectedCard.due || selectedCard.removed || '--'}</p>
                </div>
                <div>
                  <h4 className="text-white/60 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Hospital</h4>
                  <p className="font-bold text-sm truncate">{selectedCard.hospital}</p>
                </div>
                <div>
                  <h4 className="text-white/60 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Doctor</h4>
                  <p className="font-bold text-sm truncate">{selectedCard.doc}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">StentCare Network</span>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <span className="font-mono text-xs font-black opacity-80">QR</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </Layout>
  );
};

export const PatientAppointmentsPage = () => {
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const timeSlots = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'];

  const handleConfirm = () => {
    if (!newDate || !newTime) return;
    setConfirmed(true);
  };

  const handleClose = () => {
    setRescheduleTarget(null);
    setNewDate('');
    setNewTime('');
    setReason('');
    setConfirmed(false);
  };

  const upcomingAppointments = [
    { id: 1, date: '2023-12-15', time: '10:00 AM', type: 'Stent Removal Procedure', doctor: 'Dr. Smith', hospital: 'City General Hospital', phone: '(555) 123-4567', status: 'Confirmed' }
  ];
  
  const pastAppointments = [
    { id: 2, date: '2023-10-01', time: '02:30 PM', type: 'Stent Insertion Procedure', doctor: 'Dr. Smith', hospital: 'City General Hospital', status: 'Completed' },
    { id: 3, date: '2023-09-25', time: '11:15 AM', type: 'Initial Consultation', doctor: 'Dr. Smith', hospital: 'City General Hospital', status: 'Completed' }
  ];

  return (
    <Layout title="My Appointments">
      <div className="max-w-4xl mx-auto py-8">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Schedule</h3>
        <p className="text-slate-400 font-bold mt-1 mb-8">Your upcoming clinical visits and removal procedures.</p>

        {/* Reschedule Modal */}
        {rescheduleTarget && (
          <Modal
            title={confirmed ? 'Request Submitted!' : 'Reschedule Appointment'}
            subtitle={confirmed ? 'Awaiting doctor confirmation' : rescheduleTarget.type}
            icon={Calendar}
            iconBg={confirmed ? 'bg-green-50' : 'bg-blue-50'}
            iconColor={confirmed ? 'text-green-600' : 'text-blue-600'}
            onClose={handleClose}
          >
            {confirmed ? (
              <div className="text-center py-6 flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle size={40} className="text-green-500" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-800">Reschedule Requested</h4>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    Your request for <span className="font-black text-primary">{newDate}</span> at <span className="font-black text-primary">{newTime}</span> has been sent to <span className="font-black">{rescheduleTarget.doctor}</span>.
                  </p>
                  <p className="text-xs text-slate-400 mt-3">You will receive an SMS/email once the doctor confirms the new slot.</p>
                </div>
                <Button onClick={handleClose} className="w-full mt-2">Done</Button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Current appointment info */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex flex-col items-center justify-center shrink-0 text-center">
                    <span className="text-[9px] font-black uppercase">{new Date(rescheduleTarget.date).toLocaleString('default',{month:'short'})}</span>
                    <span className="text-lg font-black leading-none">{new Date(rescheduleTarget.date).getDate()}</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">Current Slot</p>
                    <p className="text-sm font-black text-slate-800">{rescheduleTarget.type}</p>
                    <p className="text-xs font-bold text-slate-500">{rescheduleTarget.time} · {rescheduleTarget.doctor}</p>
                  </div>
                </div>

                {/* New date */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">New Date</label>
                  <input
                    type="date"
                    value={newDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>

                {/* Time slots */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Preferred Time Slot</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => setNewTime(slot)}
                        className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                          newTime === slot
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Reason (Optional)</label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="e.g. Travel conflict, work schedule..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 resize-none focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>

                <Button
                  onClick={handleConfirm}
                  disabled={!newDate || !newTime}
                  className="w-full !py-4 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Confirm Reschedule Request
                </Button>
              </div>
            )}
          </Modal>
        )}

        
        {/* Upcoming Appointments */}
        <h4 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
          <CalendarClock size={20} className="text-primary" /> Upcoming Visit
        </h4>
        <div className="flex flex-col gap-4 mb-10">
          {upcomingAppointments.map((apt) => (
            <div key={apt.id} className="bg-white p-6 rounded-[24px] shadow-lg shadow-primary/5 border border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-widest">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-2xl font-black leading-none">{new Date(apt.date).getDate()}</span>
                </div>
                <div>
                  <h5 className="text-lg font-black text-slate-800">{apt.type}</h5>
                  <p className="text-sm font-bold text-slate-500 mt-1 flex items-center gap-1"><Clock size={14}/> {apt.time}</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-xl w-full md:w-auto">
                <p className="text-xs font-bold text-slate-600 flex items-center gap-2"><User size={14} className="text-slate-400"/> {apt.doctor}</p>
                <p className="text-xs font-bold text-slate-600 flex items-center gap-2"><MapPin size={14} className="text-slate-400"/> {apt.hospital}</p>
                <p className="text-xs font-bold text-slate-600 flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {apt.phone}</p>
              </div>
              
              <div className="flex gap-3 w-full md:w-auto">
                <Button onClick={() => setRescheduleTarget(apt)} className="w-full md:w-auto !py-3">Reschedule</Button>
              </div>
            </div>
          ))}
        </div>

        {/* Past Appointments */}
        <h4 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
          <Clock size={20} className="text-slate-400" /> Past Consultations
        </h4>
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-2">
          {pastAppointments.map((apt, index) => (
            <div key={apt.id} className={`flex items-center justify-between p-4 ${index !== pastAppointments.length - 1 ? 'border-b border-slate-50' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-bold text-xs uppercase">
                  {new Date(apt.date).getDate()} {new Date(apt.date).toLocaleString('default', { month: 'short' })}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{apt.type}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{apt.doctor} • {apt.hospital}</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg tracking-widest">
                {apt.status}
              </span>
            </div>
          ))}
        </div>

      </div>
    </Layout>
  );
};

export const PatientNotificationsPage = () => (
  <Layout title="Notifications">
    <div className="max-w-4xl mx-auto py-8">
      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Alerts & Reminders</h3>
      <p className="text-slate-400 font-bold mt-1 mb-8">Important updates regarding your care.</p>
      
      <div className="flex flex-col gap-3">
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-warning/20 border-l-4 border-l-warning flex items-start gap-4">
           <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
             <CalendarClock size={20} />
           </div>
           <div>
             <h4 className="text-sm font-black text-slate-800">Removal Schedule Approaching</h4>
             <p className="text-sm font-bold text-slate-500 mt-1">Your stent removal is scheduled in exactly 65 days. Please ensure you do not miss your appointment on Dec 15th.</p>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">2 HOURS AGO</p>
           </div>
        </div>

        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex items-start gap-4">
           <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
             <FileText size={20} />
           </div>
           <div>
             <h4 className="text-sm font-black text-slate-800">Post-Op Summary Available</h4>
             <p className="text-sm font-bold text-slate-500 mt-1">Your detailed discharge summary and medication notes are now available in your portal.</p>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">1 DAY AGO</p>
           </div>
        </div>
      </div>
    </div>
  </Layout>
);
