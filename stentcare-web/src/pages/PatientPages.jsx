import React from 'react';
import { Layout } from '../components/Layout';
import { PatientDashboard } from './PatientDashboard'; // Using the existing detailed one for the main dashboard

export { PatientDashboard }; // Re-export for App.jsx

export const PatientStentsPage = () => (
  <Layout title="My Stent Details">
    <div className="max-w-4xl mx-auto py-8">
      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Stent Tracking</h3>
      <p className="text-slate-400 font-bold mt-1">Detailed history and specifications of your active stents.</p>
    </div>
  </Layout>
);

export const PatientAppointmentsPage = () => (
  <Layout title="My Appointments">
    <div className="max-w-4xl mx-auto py-8">
      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Schedule</h3>
      <p className="text-slate-400 font-bold mt-1">Your upcoming clinical visits and removal procedures.</p>
    </div>
  </Layout>
);

export const PatientNotificationsPage = () => (
  <Layout title="Notifications">
    <div className="max-w-4xl mx-auto py-8">
      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Alerts & Reminders</h3>
      <p className="text-slate-400 font-bold mt-1">Important updates regarding your care.</p>
    </div>
  </Layout>
);
