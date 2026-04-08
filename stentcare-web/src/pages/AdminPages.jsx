import React from 'react';
import { Layout } from '../components/Layout';
import { initialPatients } from '../utils/mockData';

export const AdminDashboard = () => (
  <Layout title="Admin Dashboard">
    <div className="max-w-4xl mx-auto py-8">
      <h3 className="text-2xl font-black text-slate-800 tracking-tight">System Overview</h3>
      <p className="text-slate-400 font-bold mt-1">Manage platform users and view system reports.</p>
    </div>
  </Layout>
);

export const AdminDoctorsPage = () => (
  <Layout title="Manage Doctors">
    <div className="max-w-4xl mx-auto py-8">
      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Registered Doctors</h3>
      <p className="text-slate-400 font-bold mt-1">Approve and manage doctor accounts.</p>
    </div>
  </Layout>
);

export const AdminPatientsPage = () => (
  <Layout title="Manage Patients">
    <div className="max-w-4xl mx-auto py-8">
      <h3 className="text-2xl font-black text-slate-800 tracking-tight">System Patients</h3>
      <p className="text-slate-400 font-bold mt-1">View all patient records across the platform.</p>
    </div>
  </Layout>
);

export const AdminReportsPage = () => (
  <Layout title="System Reports">
    <div className="max-w-4xl mx-auto py-8">
      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Analytics & Reports</h3>
      <p className="text-slate-400 font-bold mt-1">System-wide operational metrics.</p>
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
