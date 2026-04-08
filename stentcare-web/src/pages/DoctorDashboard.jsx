import React, { useState, useMemo, useEffect } from 'react';
import {
  UserPlus,
  Activity,
  Calendar,
  Search,
  AlertCircle,
  Clock,
  CheckCircle,
  Users,
  MoreVertical,
  Filter,
  Download,
  Plus,
  Stethoscope,
  TrendingUp,
  ChevronRight,
  X,
  Phone,
  CalendarCheck
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { Table, ValidatedInput, Button } from '../components/UIComponents';
import { validatePhone, validateAge, formatPhoneNumber } from '../utils/validation';
import { useAuth } from '../context/AuthContext';
import { initialPatients, calcDays, calculateDueDate } from '../utils/mockData';
import { apiFetch } from '../utils/api';
import { Edit2, Check, ArrowRightCircle } from 'lucide-react';

const statusConfig = {
  overdue:  { label: 'Overdue',  bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-red-500'    },
  upcoming: { label: 'Upcoming', bg: 'bg-amber-100',  text: 'text-amber-600',  dot: 'bg-amber-400'  },
  safe:     { label: 'Active',   bg: 'bg-emerald-100',text: 'text-emerald-600',dot: 'bg-emerald-500' },
};

const StatusBadge = ({ status, isRemoved }) => {
  if (isRemoved) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
        <CheckCircle size={10} /> Removed
      </span>
    );
  }
  const c = statusConfig[status] || statusConfig.safe;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
      {c.label}
    </span>
  );
};

/* ─── stat card ─── */
const MedStatCard = ({ label, value, icon: Icon, bgColor, iconColor, borderColor, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-2xl p-6 border-l-4 ${borderColor} shadow-sm hover:shadow-md cursor-pointer active:scale-95 hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3`}
  >
    <div className="flex items-center justify-between">
      <div className={`w-11 h-11 ${bgColor} rounded-xl flex items-center justify-center`}>
        <Icon size={22} className={iconColor} strokeWidth={2.5} />
      </div>
      <TrendingUp size={16} className="text-slate-300" />
    </div>
    <div>
      <p className="text-3xl font-black text-slate-800">{value}</p>
      <p className="text-sm font-semibold text-slate-400 mt-0.5">{label}</p>
    </div>
  </div>
);

/* ─── quick action ─── */
const QuickAction = ({ icon: Icon, label, color, bgColor, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 border border-slate-100 group w-full"
  >
    <div className={`w-14 h-14 ${bgColor} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={28} className={color} strokeWidth={2.5} />
    </div>
    <span className="text-sm font-bold text-slate-700">{label}</span>
  </button>
);

/* ─── modal ─── */
const Modal = ({ title, subtitle, icon: Icon, iconBg, iconColor, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-7 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${iconBg} ${iconColor} rounded-2xl flex items-center justify-center`}>
            <Icon size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">{title}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-7">{children}</div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════
    MAIN DASHBOARD
═══════════════════════════════════════════ */
export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState(initialPatients);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddStent, setShowAddStent]   = useState(false);

  /* ── form state ── */
  const emptyForm = { name: '', stentId: '', age: '', phone: '', insertedDate: '', dueDate: '' };
  const [formData, setFormData]   = useState(emptyForm);
  const [stentForm, setStentForm] = useState({ patientName: '', stentId: '', insertedDate: '', dueDate: '' });
  const [editPatient, setEditPatient] = useState(null);
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(true);

  /* ── backend connection hook ── */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Attempt to fetch live dashboard data from Django backend
        const data = await apiFetch('/doctor/dashboard/');
        
        if (data) {
          if (Array.isArray(data.patients)) setPatients(data.patients);
          // If the backend provides separate stats, ensure they match the image
        }
      } catch (err) {
        console.warn("Backend unavailable, using local mock data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  /* ── computed stats ── */
  const stats = useMemo(() => ({
    total:    patients.length,
    active:   patients.filter(p => !p.isRemoved).length,
    upcoming: patients.filter(p => !p.isRemoved && p.status === 'upcoming').length,
    overdue:  patients.filter(p => !p.isRemoved && p.status === 'overdue').length,
  }), [patients]);

  /* ── filtered table ── */
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.stentId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [patients, searchQuery, filterStatus]);

  /* ── upcoming removals (next 30 days) ── */
  const upcomingRemovals = useMemo(() =>
    patients
      .filter(p => { const d = calcDays(p.removalDate); return d >= 0 && d <= 30; })
      .sort((a, b) => new Date(a.removalDate) - new Date(b.removalDate)),
    [patients]
  );

  /* ── field change handler ── */
  const handleFormChange = (setter, targetForm) => (field, value) => {
    let finalValue = value;
    let error = '';
    if (field === 'phone') { const r = validatePhone(value); finalValue = r.value; error = r.error; }
    else if (field === 'age') { const r = validateAge(value); finalValue = r.value; error = r.error; }
    
    // Auto-calculate removal date (90 days)
    if (field === 'insertedDate') {
      const duo = calculateDueDate(value);
      setter(prev => ({ ...prev, [field]: value, dueDate: duo }));
    } else {
      setter(prev => ({ ...prev, [field]: finalValue }));
    }
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const toggleRemovalStatus = (patientId) => {
    setPatients(prev => prev.map(p => 
      p.id === patientId ? { ...p, isRemoved: !p.isRemoved } : p
    ));
  };

  /* ── submit add/edit patient ── */
  const handleAddPatient = (e) => {
    e.preventDefault();
    const days = calcDays(formData.dueDate);
    const status = days < 0 ? 'overdue' : days <= 30 ? 'upcoming' : 'safe';
    
    if (editPatient) {
      setPatients(prev => prev.map(p => 
        p.id === editPatient.id 
          ? { ...p, ...formData, status } 
          : p
      ));
      setEditPatient(null);
    } else {
      const newPatient = {
        id: patients.length + 1,
        name: formData.name,
        stentId: formData.stentId,
        phone: formData.phone,
        age: formData.age,
        insertedDate: formData.insertedDate,
        removalDate: formData.dueDate,
        status,
        isRemoved: false
      };
      setPatients(prev => [newPatient, ...prev]);
    }
    
    setFormData(emptyForm);
    setShowAddPatient(false);
  };

  /* ── submit add stent ── */
  const handleAddStent = (e) => {
    e.preventDefault();
    const days = calcDays(stentForm.dueDate);
    const status = days < 0 ? 'overdue' : days <= 30 ? 'upcoming' : 'safe';
    const matched = patients.find(p => p.name.toLowerCase() === stentForm.patientName.toLowerCase());
    if (matched) {
      setPatients(prev => prev.map(p =>
        p.id === matched.id
          ? { ...p, stentId: stentForm.stentId, insertedDate: stentForm.insertedDate, removalDate: stentForm.dueDate, status }
          : p
      ));
    } else {
      setPatients(prev => [{
        id: prev.length + 1,
        name: stentForm.patientName,
        stentId: stentForm.stentId,
        phone: '',
        age: '',
        insertedDate: stentForm.insertedDate,
        removalDate: stentForm.dueDate,
        status
      }, ...prev]);
    }
    setStentForm({ patientName: '', stentId: '', insertedDate: '', dueDate: '' });
    setShowAddStent(false);
  };

  const doctorName = user?.name ? `Dr. ${user.name.split(' ')[0].charAt(0).toUpperCase() + user.name.split(' ')[0].slice(1)} ${user.name.split(' ')[1] || ''}`.trim() : 'Doctor';

  return (
    <Layout title="Doctor Dashboard">
      <div className="flex flex-col gap-8">

        {/* ─── Welcome Banner ─── */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-3xl p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-blue-200/50">
          <div>
            <p className="text-blue-200 text-sm font-semibold mb-1">Welcome back,</p>
            <h2 className="text-3xl font-black">{doctorName}</h2>
            <p className="text-blue-100 text-sm mt-2 font-medium">Monitor and manage stent patients from your clinical portal.</p>
          </div>
          <div className="flex gap-4 shrink-0">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 text-center border border-white/20">
              <p className="text-2xl font-black">{stats.total}</p>
              <p className="text-[11px] text-blue-100 font-semibold mt-1">Total Patients</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 text-center border border-white/20">
              <p className="text-2xl font-black">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
              <p className="text-[11px] text-blue-100 font-semibold mt-1">Today</p>
            </div>
          </div>
        </div>

        {/* ─── Stats Cards ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <MedStatCard label="Total Patients"    value={stats.total}    icon={Users}       bgColor="bg-blue-50"   iconColor="text-blue-600"   borderColor="border-blue-500"   onClick={() => setFilterStatus('all')} />
          <MedStatCard label="Active Stents"     value={stats.active}   icon={Activity}    bgColor="bg-green-50"  iconColor="text-green-600"  borderColor="border-green-500"  onClick={() => setFilterStatus('safe')} />
          <MedStatCard label="Upcoming Removals" value={stats.upcoming} icon={Clock}       bgColor="bg-amber-50"  iconColor="text-amber-500"  borderColor="border-amber-400"  onClick={() => setFilterStatus('upcoming')} />
          <MedStatCard label="Overdue Cases"     value={stats.overdue}  icon={AlertCircle} bgColor="bg-red-50"    iconColor="text-red-500"    borderColor="border-red-500"    onClick={() => setFilterStatus('overdue')} />
        </div>

        {/* ─── Quick Actions + Upcoming Removals ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Quick Actions */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                <Stethoscope size={18} className="text-blue-600" />
              </div>
              <h3 className="text-base font-black text-slate-800">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <QuickAction icon={UserPlus} label="Add Patient" color="text-blue-600"  bgColor="bg-blue-50"  onClick={() => setShowAddPatient(true)} />
              <QuickAction icon={Plus}     label="Add Stent"   color="text-green-600" bgColor="bg-green-50" onClick={() => setShowAddStent(true)}   />
            </div>
            {/* Overdue Alerts */}
            {stats.overdue > 0 && (
              <div className="mt-5 p-4 bg-red-50 rounded-2xl border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} className="text-red-500" />
                  <p className="text-xs font-black text-red-600 uppercase tracking-wide">Urgent Alert</p>
                </div>
                <p className="text-sm font-semibold text-red-700">
                  {stats.overdue} patient{stats.overdue > 1 ? 's have' : ' has'} an overdue stent removal.
                </p>
              </div>
            )}
          </div>

          {/* Upcoming Removals */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
                  <CalendarCheck size={18} className="text-amber-500" />
                </div>
                <h3 className="text-base font-black text-slate-800">Upcoming Removals</h3>
              </div>
              <button className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {upcomingRemovals.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-semibold text-sm">
                  No removals due in the next 30 days.
                </div>
              ) : (
                upcomingRemovals.map(p => {
                  const daysLeft = calcDays(p.removalDate);
                  const isUrgent = daysLeft <= 7;
                  return (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-blue-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center font-black text-blue-600 text-base">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm leading-none">{p.name}</p>
                          <p className="text-xs text-slate-400 font-semibold mt-1">{p.stentId} · Due {p.removalDate}</p>
                        </div>
                      </div>
                      <div className={`text-sm font-black px-3 py-1 rounded-full ${isUrgent ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'}`}>
                        {daysLeft === 0 ? 'Today!' : `${daysLeft} days left`}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ─── Search & Filters ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-3">
             <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
             <h3 className="text-2xl font-black text-slate-800 tracking-tight">System Records</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group flex-1 md:w-80">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search by name or Stent ID..."
                className="w-full bg-white border border-slate-200 py-3 pl-12 pr-4 rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="bg-white border border-slate-200 py-3 px-4 rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all cursor-pointer"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">All Records</option>
              <option value="safe">Active Only</option>
              <option value="upcoming">Upcoming Due</option>
              <option value="overdue">Overdue Cases</option>
            </select>
          </div>
        </div>

        {/* ─── Patient Management Table ─── */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Table 
            headers={['Patient Details', 'Stent ID', 'Removal Due', 'Status', 'Actions']}
            data={filteredPatients}
            renderRow={(p) => (
              <tr key={p.id} className="hover:bg-blue-50/30 transition-all group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 leading-none">{p.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{p.age} Yrs · {p.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm font-bold text-slate-600">
                  <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">{p.stentId}</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">{p.removalDate}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{calcDays(p.removalDate)} days left</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <StatusBadge status={p.status} isRemoved={p.isRemoved} />
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setEditPatient(p); setFormData(p); setShowAddPatient(true); }}
                      className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit Patient"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => toggleRemovalStatus(p.id)}
                      className={`p-1.5 rounded-lg transition-all ${p.isRemoved ? 'text-green-500 hover:bg-green-50' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
                      title={p.isRemoved ? "Mark as Active" : "Confirm Removal"}
                    >
                      {p.isRemoved ? <CheckCircle size={18} /> : <Check size={18} />}
                    </button>
                  </div>
                </td>
              </tr>
            )}
          />
        </div>

      </div>

      {/* ═══ ADD PATIENT MODAL ═══ */}
      {showAddPatient && (
        <Modal
          title="Add New Patient"
          subtitle="Register Patient & Stent"
          icon={UserPlus}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          onClose={() => { setShowAddPatient(false); setFormData(emptyForm); setErrors({}); }}
        >
          <form onSubmit={handleAddPatient} className="space-y-5">
            <ValidatedInput
              label="Patient Full Name"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={e => handleFormChange(setFormData)('name', e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <ValidatedInput
                label="Patient Age"
                placeholder="25"
                numericOnly maxLength={2}
                value={formData.age}
                onChange={e => handleFormChange(setFormData)('age', e.target.value)}
                error={errors.age}
                required
              />
              <ValidatedInput
                label="Phone Number"
                placeholder="98765 43210"
                numericOnly maxLength={11}
                value={formatPhoneNumber(formData.phone)}
                onChange={e => handleFormChange(setFormData)('phone', e.target.value)}
                error={errors.phone}
                required
              />
            </div>
            <ValidatedInput
              label="Stent Serial ID"
              placeholder="ST-999"
              value={formData.stentId}
              onChange={e => handleFormChange(setFormData)('stentId', e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <ValidatedInput
                label="Insertion Date"
                type="date"
                value={formData.insertedDate}
                onChange={e => handleFormChange(setFormData)('insertedDate', e.target.value)}
                required
              />
              <ValidatedInput
                label="Removal Due Date"
                type="date"
                value={formData.dueDate}
                onChange={e => handleFormChange(setFormData)('dueDate', e.target.value)}
                required
              />
            </div>
            <div className="pt-2 flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => { setShowAddPatient(false); setFormData(emptyForm); setErrors({}); }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 shadow-lg shadow-blue-200"
                disabled={!formData.name || !formData.stentId || !formData.dueDate || formData.phone.length < 10 || !!errors.phone || !!errors.age}
              >
                <CheckCircle size={16} /> Register Patient
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ═══ ADD STENT MODAL ═══ */}
      {showAddStent && (
        <Modal
          title="Add / Assign Stent"
          subtitle="New Stent Registration"
          icon={Activity}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          onClose={() => { setShowAddStent(false); setStentForm({ patientName: '', stentId: '', insertedDate: '', dueDate: '' }); }}
        >
          <form onSubmit={handleAddStent} className="space-y-5">
            <ValidatedInput
              label="Patient Name"
              placeholder="e.g. John Doe"
              value={stentForm.patientName}
              onChange={e => setStentForm(prev => ({ ...prev, patientName: e.target.value }))}
              required
            />
            <ValidatedInput
              label="Stent Serial ID"
              placeholder="ST-999"
              value={stentForm.stentId}
              onChange={e => setStentForm(prev => ({ ...prev, stentId: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <ValidatedInput
                label="Insertion Date"
                type="date"
                value={stentForm.insertedDate}
                onChange={e => setStentForm(prev => ({ ...prev, insertedDate: e.target.value }))}
                required
              />
              <ValidatedInput
                label="Removal Due Date"
                type="date"
                value={stentForm.dueDate}
                onChange={e => setStentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>
            <div className="pt-2 flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowAddStent(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 shadow-lg shadow-green-200"
                disabled={!stentForm.patientName || !stentForm.stentId || !stentForm.dueDate}
              >
                <CheckCircle size={16} /> Assign Stent
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </Layout>
  );
};
