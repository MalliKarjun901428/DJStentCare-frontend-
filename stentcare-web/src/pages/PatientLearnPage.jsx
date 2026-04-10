import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import {
  BookOpen, ChevronDown, ChevronUp, Droplets, Activity,
  ShieldCheck, Clock, AlertCircle, Pill, FileText, ArrowRight
} from 'lucide-react';

const faqs = [
  {
    q: 'What is a ureteral stent?',
    a: 'A ureteral stent is a thin, flexible tube inserted into the ureter (the tube connecting kidney to bladder) to keep it open so urine can drain freely from the kidney to the bladder. It is typically placed after procedures like kidney stone removal or ureteroscopy.',
  },
  {
    q: 'How long will the stent remain inside me?',
    a: 'Most stents are kept in for 1–6 weeks, depending on the procedure and your doctor\'s recommendation. Your StentCare dashboard shows your exact removal date. Never remove or pull the stent string yourself.',
  },
  {
    q: 'Is it normal to feel discomfort?',
    a: 'Yes. Mild discomfort, frequent urination, or a burning sensation are common. Stent-related discomfort is usually manageable with medications. Severe pain, high fever, or blood in urine requiring immediate attention.',
  },
  {
    q: 'Can I exercise or travel with a stent?',
    a: 'Light walking is encouraged. Avoid strenuous exercise, heavy lifting, and contact sports. Short travel is generally fine, but always carry a copy of your stent record card. Consult your doctor before long trips.',
  },
  {
    q: 'What foods should I eat or avoid?',
    a: 'Drink plenty of water (at least 2–3 litres/day). Avoid excess caffeine, alcohol, and oxalate-rich foods (spinach, nuts, chocolate). A low-sodium, plant-rich diet supports kidney health.',
  },
  {
    q: 'What happens if I miss my removal appointment?',
    a: 'A forgotten or retained stent can cause serious complications including encrustation, infection, or blockage. Contact your doctor immediately if you are unable to make your scheduled appointment.',
  },
];

const tips = [
  { icon: Droplets, color: 'blue', label: 'Stay Hydrated', body: 'Drink 8+ glasses of water every day. Hydration helps flush bacteria and prevents mineral build-up on the stent.' },
  { icon: Pill, color: 'purple', label: 'Take Medications', body: 'Take all prescribed alpha-blockers and pain relievers on time. Do not skip doses — they help relax the ureter muscles.' },
  { icon: Activity, color: 'emerald', label: 'Monitor Symptoms', body: 'Log your daily symptoms using the Wellness Tracker. Report fever >38°C, heavy blood in urine, or extreme pain to your doctor.' },
  { icon: ShieldCheck, color: 'indigo', label: 'Keep Your Card Ready', body: 'Always carry your digital stent card. If you visit any ER, show it to the attending physician immediately.' },
  { icon: Clock, color: 'orange', label: 'Never Miss Removal', body: 'Missing stent removal can cause serious infections. Your StentCare reminders will notify you before the due date.' },
  { icon: FileText, color: 'rose', label: 'Post-Op Notes', body: 'Review your discharge summary. It contains medication doses, follow-up dates, and warning signs specific to your procedure.' },
];

const colorMap = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
  emerald:{ bg: 'bg-emerald-50',text: 'text-emerald-600',border: 'border-emerald-100' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-500', border: 'border-orange-100' },
  rose:   { bg: 'bg-rose-50',   text: 'text-rose-500',   border: 'border-rose-100' },
};

export const PatientLearnPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <Layout title="Learn">
      <div className="max-w-4xl mx-auto space-y-14 pb-12">

        {/* Hero */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">Know Your Stent</h3>
            <p className="text-slate-400 font-bold mt-1">Education, care tips, and answers to frequently asked questions.</p>
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-blue-100">
            <BookOpen size={14} /> Patient Education
          </span>
        </div>

        {/* Care Tips Grid */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-primary rounded-full" />
            <h4 className="text-2xl font-black text-slate-800">Essential Care Tips</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tips.map(({ icon: Icon, color, label, body }) => {
              const c = colorMap[color];
              return (
                <div key={label} className={`bg-white rounded-3xl p-6 border ${c.border} shadow-sm group hover:shadow-lg transition-shadow`}>
                  <div className={`w-12 h-12 rounded-2xl ${c.bg} ${c.text} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={22} strokeWidth={2.5} />
                  </div>
                  <h5 className="text-sm font-black text-slate-800 mb-2">{label}</h5>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">{body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ Accordion */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-indigo-500 rounded-full" />
            <h4 className="text-2xl font-black text-slate-800">Frequently Asked Questions</h4>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map((item, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${openFaq === i ? 'border-primary/30 shadow-lg shadow-primary/5' : 'border-slate-100 shadow-sm'}`}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className={`text-sm font-black ${openFaq === i ? 'text-primary' : 'text-slate-800'} group-hover:text-primary transition-colors`}>{item.q}</span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ml-4 transition-colors ${openFaq === i ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'}`}>
                    {openFaq === i ? <ChevronUp size={16} strokeWidth={3} /> : <ChevronDown size={16} strokeWidth={3} />}
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 animate-in slide-in-from-top-2 duration-200">
                    <div className="h-px bg-slate-100 mb-4" />
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Resource Banner */}
        <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-primary/20">
          <div>
            <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Need more info?</p>
            <h5 className="text-xl font-black">Talk to your Medical Provider</h5>
            <p className="text-sm font-medium opacity-70 mt-1">Your doctor is the best source for personalised care advice.</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-2xl font-black text-sm shadow-lg hover:scale-105 active:scale-95 transition-all whitespace-nowrap">
            Contact Provider <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </Layout>
  );
};
