import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, Calendar, Bell, Search, Filter, Download, MoreVertical, 
  UserPlus, Plus, CalendarCheck, Phone, CheckCircle, AlertCircle, Clock
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { initialPatients, initialAppointments, getStatusConfig, calcDays, calculateDueDate } from '../utils/mockData';
import { apiFetch } from '../utils/api';
import { Modal, ValidatedInput, Button, Select } from '../components/UIComponents';
import { validatePhone, validateAge, formatPhoneNumber } from '../utils/validation';

const StatusBadge = ({ status, label }) => {
  const config = getStatusConfig();
  const c = config[status] || config.safe;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
      {label || c.label}
    </span>
  );
};

/* ═══════════════════════════════════════════
    PATIENTS PAGE
═══════════════════════════════════════════ */
export const DoctorPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const emptyForm = { full_name: '', phone: '', age: '', gender: 'Other' };
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/doctor/patients/');
      if (data && data.patients) {
        setPatients(data.patients);
      }
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      // Fallback to mock data if API fails during development
      setPatients(initialPatients.map(p => ({
        ...p,
        full_name: p.name,
        display_status: p.status === 'safe' ? 'Active' : p.status === 'upcoming' ? 'Upcoming' : 'Overdue',
        status_color: p.status
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleFormChange = (field, value) => {
    let finalValue = value;
    let error = '';
    
    if (field === 'phone') {
      const r = validatePhone(value);
      finalValue = r.value;
      error = r.error;
    } else if (field === 'age') {
      const r = validateAge(value);
      finalValue = r.value;
      error = r.error;
    }

    setFormData(prev => ({ ...prev, [field]: finalValue }));
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      // Simulate small delay
      await new Promise(res => setTimeout(res, 500));
      
      let success = false;
      try {
        await apiFetch('/doctor/add_patient/', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        success = true;
      } catch (err) {
        console.warn("API offline, falling back to local addition");
        const newPatient = {
          id: Date.now(),
          full_name: formData.full_name,
          age: formData.age,
          phone: formData.phone,
          status_color: 'safe',
          display_status: 'Active',
          stent_id: null
        };
        setPatients(prev => [newPatient, ...prev]);
      }

      setShowAddModal(false);
      setFormData(emptyForm);
      if (success) {
        fetchPatients(); // Reload list from server if successful
      }
    } catch (err) {
      alert(err.message || "Failed to add patient");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    (p.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.patient_id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout title="Patient Directory">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">All Patients</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">Manage patient profiles and contact information.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary !px-6 !py-2.5 text-sm"
          >
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
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    Loading patients...
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    No patients found
                  </td>
                </tr>
              ) : (
                filteredPatients.map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                          {(p.full_name || 'P').charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{p.full_name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{p.patient_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">{p.age || '--'} years</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600 flex items-center gap-1.5 whitespace-nowrap"><Phone size={14}/> {p.phone}</td>
                    <td className="px-6 py-4"><span className="font-mono text-xs font-bold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{p.stent_id || 'No Active Stent'}</span></td>
                    <td className="px-6 py-4">
                      <StatusBadge status={p.status_color || 'safe'} label={p.display_status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AddPatientModal 
        isOpen={showAddModal} 
        onClose={() => { setShowAddModal(false); setFormData(emptyForm); setErrors({}); }}
        onSubmit={handleAddPatient}
        formData={formData}
        onChange={handleFormChange}
        errors={errors}
        submitting={submitting}
      />
    </Layout>
  );
};

/* ─── Add Patient Modal ─── */
const AddPatientModal = ({ isOpen, onClose, onSubmit, formData, onChange, errors, submitting }) => {
  if (!isOpen) return null;
  return (
    <Modal
      title="Add New Patient"
      subtitle="Register Patient Profile"
      icon={UserPlus}
      iconBg="bg-blue-50"
      iconColor="text-blue-600"
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <ValidatedInput 
          label="Full Name" 
          placeholder="e.g. Sarah Conner" 
          value={formData.full_name}
          onChange={e => onChange('full_name', e.target.value)}
          required 
        />
        <div className="grid grid-cols-2 gap-4">
          <ValidatedInput 
            label="Age" 
            placeholder="34" 
            value={formData.age}
            onChange={e => onChange('age', e.target.value)}
            numericOnly
            maxLength={3}
            error={errors.age}
            required 
          />
          <Select 
            label="Gender" 
            options={[
              { label: 'Male', value: 'Male' },
              { label: 'Female', value: 'Female' },
              { label: 'Other', value: 'Other' }
            ]}
            value={formData.gender}
            onChange={e => onChange('gender', e.target.value)}
          />
        </div>
        <ValidatedInput 
          label="Phone Number" 
          placeholder="98765 43210" 
          value={formatPhoneNumber(formData.phone)}
          onChange={e => onChange('phone', e.target.value)}
          numericOnly
          maxLength={11}
          error={errors.phone}
          required 
        />
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} type="button">Cancel</Button>
          <Button className="flex-1" type="submit" disabled={submitting || !!errors.phone || !!errors.age}>
            {submitting ? 'Creating...' : 'Add Patient'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

/* ═══════════════════════════════════════════
    STENTS PAGE
═══════════════════════════════════════════ */
export const DoctorStentsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [stentForm, setStentForm] = useState({
    patient_id: '',
    stent_id: '',
    insertion_date: new Date().toISOString().split('T')[0],
    expected_removal_date: calculateDueDate(new Date().toISOString().split('T')[0]),
    notes: ''
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/doctor/patients/');
      if (data && data.patients) {
        setPatients(data.patients);
      }
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      // Fallback
      setPatients(initialPatients.map(p => ({
        ...p,
        full_name: p.name,
        display_status: p.status === 'safe' ? 'Active' : p.status === 'upcoming' ? 'Upcoming' : 'Overdue',
        status_color: p.status
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleRegisterStent = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await new Promise(res => setTimeout(res, 500));

      let success = false;
      try {
        await apiFetch('/stent/add/', {
          method: 'POST',
          body: JSON.stringify(stentForm)
        });
        success = true;
      } catch (err) {
        console.warn("API offline, falling back to local stent registration");
        setPatients(prev => prev.map(p => {
          if (p.id.toString() === stentForm.patient_id.toString()) {
             return {
               ...p,
               stent_id: stentForm.stent_id || `ST-${Math.floor(Math.random() * 10000)}`,
               insertion_date: stentForm.insertion_date,
               expected_removal_date: stentForm.expected_removal_date,
               days_left: typeof calcDays !== 'undefined' ? calcDays(stentForm.expected_removal_date) : 30, // fallback
               status_color: 'safe',
               display_status: 'Active'
             };
          }
          return p;
        }));
      }

      setShowAddModal(false);
      
      if (success) {
        fetchPatients(); // Reload list from server
      }
    } catch (err) {
      alert(err.message || "Failed to register stent");
    } finally {
      setSubmitting(false);
    }
  };

  const activeStents = patients.filter(p => p.stent_id);

  return (
    <Layout title="Stent Tracking">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Active Stents</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">Track inserted stents and removal deadlines.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary bg-green-500 hover:bg-green-600 shadow-green-500/30 !px-6 !py-2.5 text-sm"
          >
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
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    Loading records...
                  </td>
                </tr>
              ) : activeStents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    No active stents found. Add a stent to a patient to get started.
                  </td>
                </tr>
              ) : (
                activeStents.map(p => {
                  const days = p.days_left;
                  const isOverdue = days < 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                          {p.stent_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-sm text-slate-800">{p.full_name}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-500">{p.insertion_date || '--'}</td>
                      <td className="px-6 py-4 font-bold text-sm text-slate-700">{p.expected_removal_date || '--'}</td>
                      <td className="px-6 py-4">
                        {isOverdue ? (
                          <span className="text-sm font-black text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} /> {Math.abs(days)}d overdue
                          </span>
                        ) : (
                          <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                            <Clock size={14} /> {days}d left
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={p.status_color || 'safe'} label={p.display_status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <RegisterStentModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleRegisterStent}
        patients={patients}
        formData={stentForm}
        setFormData={setStentForm}
        submitting={submitting}
      />
    </Layout>
  );
};

/* ─── Register Stent Modal ─── */
const RegisterStentModal = ({ isOpen, onClose, onSubmit, patients, formData, setFormData, submitting }) => {
  if (!isOpen) return null;

  const handleDateChange = (field, val) => {
    if (field === 'insertion_date') {
      const duo = calculateDueDate(val);
      setFormData(prev => ({ ...prev, insertion_date: val, expected_removal_date: duo }));
    } else {
      setFormData(prev => ({ ...prev, [field]: val }));
    }
  };

  return (
    <Modal
      title="Register Stent"
      subtitle="New Stent Insertion Record"
      icon={Plus}
      iconBg="bg-green-50"
      iconColor="text-green-600"
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <Select 
          label="Select Patient" 
          options={[
            { label: 'Choose a patient...', value: '', disabled: true },
            ...patients.map(p => ({ label: p.full_name, value: p.id }))
          ]}
          value={formData.patient_id}
          onChange={e => setFormData(prev => ({ ...prev, patient_id: e.target.value }))}
          required 
        />
        <ValidatedInput 
          label="Stent Serial ID (Optional)" 
          placeholder="ST-XXXXX" 
          value={formData.stent_id}
          onChange={e => setFormData(prev => ({ ...prev, stent_id: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-4">
          <ValidatedInput 
            label="Insertion Date" 
            type="date" 
            value={formData.insertion_date}
            onChange={e => handleDateChange('insertion_date', e.target.value)}
            required 
          />
          <ValidatedInput 
            label="Expected Removal" 
            type="date" 
            value={formData.expected_removal_date}
            onChange={e => handleDateChange('expected_removal_date', e.target.value)}
            required 
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Clinical Notes</label>
          <textarea 
            className="input-base min-h-[100px] py-4"
            placeholder="Add any specific clinical notes or observations..."
            value={formData.notes}
            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} type="button">Cancel</Button>
          <Button className="flex-1 bg-green-500 hover:bg-green-600 shadow-green-200" type="submit" disabled={submitting || !formData.patient_id}>
            {submitting ? 'Registering...' : 'Confirm Registration'}
          </Button>
        </div>
      </form>
    </Modal>
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
