import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import {
  AlertCircle, Phone, MapPin, Activity, Clock,
  Thermometer, Droplets, Heart, ChevronRight, Shield
} from 'lucide-react';

const emergencyContacts = [
  { label: 'Your Urologist', name: 'Dr. Smith', subtitle: 'Senior Urologist', phone: '+91 98765 43210', color: 'blue' },
  { label: 'Hospital Helpline', name: 'City General Hospital', subtitle: 'Emergency Department', phone: '+91 80 2345 6789', color: 'indigo' },
  { label: 'National Emergency', name: 'Ambulance Service', subtitle: 'Available 24 / 7', phone: '112', color: 'red' },
];

const warningSymptoms = [
  { icon: Thermometer, color: 'red', symptom: 'Fever above 38.5°C / 101°F', action: 'Go to Emergency Room immediately. May indicate a kidney infection.' },
  { icon: Droplets, color: 'red', symptom: 'Heavy or persistent blood in urine', action: 'Contact your urologist or proceed to the ER. Light pink tinge is normal; bright red clots are not.' },
  { icon: AlertCircle, color: 'orange', symptom: 'Severe uncontrolled flank or back pain', action: 'Take your prescribed pain relief first. If pain persists beyond 30 mins, seek emergency care.' },
  { icon: Heart, color: 'orange', symptom: 'Rapid heartbeat with chills or shivering', action: 'Possible signs of sepsis. Call emergency services (112) immediately.' },
  { icon: Activity, color: 'orange', symptom: 'Inability to urinate for 6+ hours', action: 'Could indicate a blocked stent. Contact your doctor or go to the ER.' },
  { icon: Clock, color: 'yellow', symptom: 'Stent removal date passed (overdue)', action: 'Call your doctor to schedule an urgent appointment. Do NOT pull the stent string yourself.' },
];

const colorMap = {
  red:    { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',   badge: 'bg-red-100 text-red-700' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-500', border: 'border-orange-200',badge: 'bg-orange-100 text-orange-700' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200',badge: 'bg-yellow-100 text-yellow-700' },
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100',  badge: 'bg-blue-100 text-blue-700' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100',badge: 'bg-indigo-100 text-indigo-700' },
};

const steps = [
  'Stay calm — panic worsens pain.',
  'Note your symptoms & when they started.',
  'Check your StentCare reminders for removal date.',
  'Call your doctor or the hospital helpline first.',
  'Proceed to the Emergency Department if told to.',
  'Bring your Digital Stent Card (accessible from "My Stent Details").',
];

export const PatientEmergencyPage = () => {
  const [called, setCalled] = useState(null);

  return (
    <Layout title="Emergency">
      <div className="max-w-4xl mx-auto space-y-12 pb-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">Emergency Guide</h3>
            <p className="text-slate-400 font-bold mt-1">Know when to act and who to call — your safety reference.</p>
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-red-100">
            <Shield size={14} /> Safety & Emergency
          </span>
        </div>

        {/* Emergency Contacts */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-red-500 rounded-full" />
            <h4 className="text-2xl font-black text-slate-800">Emergency Contacts</h4>
          </div>

          <div className="flex flex-col gap-4">
            {emergencyContacts.map((c) => {
              const cm = colorMap[c.color];
              return (
                <div key={c.label} className={`bg-white rounded-2xl border ${cm.border} p-5 flex items-center justify-between gap-4 shadow-sm group hover:shadow-md transition-shadow`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${cm.bg} ${cm.text} flex items-center justify-center shrink-0`}>
                      <Phone size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${cm.text} mb-0.5`}>{c.label}</p>
                      <p className="text-base font-black text-slate-800">{c.name}</p>
                      <p className="text-xs font-bold text-slate-400">{c.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-slate-700 font-mono hidden sm:block">{c.phone}</span>
                    <a
                      href={`tel:${c.phone.replace(/\s/g, '')}`}
                      onClick={() => setCalled(c.label)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md ${called === c.label ? 'bg-green-500 text-white shadow-green-200' : `${cm.bg} ${cm.text} hover:shadow-lg`}`}
                    >
                      {called === c.label ? '✓ Calling...' : <><Phone size={14} /> Call</>}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Warning Symptoms */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-orange-500 rounded-full" />
            <h4 className="text-2xl font-black text-slate-800">Warning Symptoms & Actions</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warningSymptoms.map(({ icon: Icon, color, symptom, action }) => {
              const cm = colorMap[color];
              return (
                <div key={symptom} className={`bg-white rounded-2xl border ${cm.border} p-5 shadow-sm group hover:shadow-md transition-shadow flex gap-4`}>
                  <div className={`w-11 h-11 rounded-xl ${cm.bg} ${cm.text} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 mb-1.5">{symptom}</p>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">{action}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* What to do step-by-step */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-indigo-500 rounded-full" />
            <h4 className="text-2xl font-black text-slate-800">What To Do In An Emergency</h4>
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-5 px-6 py-4 group hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm font-bold text-slate-700 flex-1">{step}</p>
                <ChevronRight size={16} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
              </div>
            ))}
          </div>
        </section>

        {/* Location CTA */}
        <div className="bg-gradient-to-br from-red-500 to-rose-700 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-red-500/20">
          <div>
            <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Can't reach your doctor?</p>
            <h5 className="text-xl font-black">Find the Nearest Emergency Room</h5>
            <p className="text-sm font-medium opacity-70 mt-1">Use Google Maps to locate the closest hospital immediately.</p>
          </div>
          <a
            href="https://www.google.com/maps/search/emergency+hospital+near+me"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-2xl font-black text-sm shadow-lg hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
          >
            <MapPin size={16} /> Find Nearest Hospital
          </a>
        </div>

      </div>
    </Layout>
  );
};
