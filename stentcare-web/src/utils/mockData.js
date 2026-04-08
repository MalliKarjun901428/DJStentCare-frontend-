// src/utils/mockData.js

export const initialPatients = [
  { id: 1, name: 'Sarah Conner',   stentId: 'ST-101', phone: '9876543210', age: '34', insertedDate: '2024-01-10', removalDate: '2026-05-10', status: 'safe'     },
  { id: 2, name: 'John Doe',       stentId: 'ST-102', phone: '9123456789', age: '52', insertedDate: '2024-02-15', removalDate: '2026-04-12', status: 'upcoming'  },
  { id: 3, name: 'Michael Scott',  stentId: 'ST-103', phone: '9000011122', age: '45', insertedDate: '2023-11-01', removalDate: '2024-01-15', status: 'overdue'   },
  { id: 4, name: 'Elena Gilbert',  stentId: 'ST-104', phone: '9988776655', age: '28', insertedDate: '2024-03-05', removalDate: '2026-07-05', status: 'safe'      },
  { id: 5, name: 'Harish Kumar',   stentId: 'ST-105', phone: '9871234560', age: '60', insertedDate: '2025-12-01', removalDate: '2026-04-16', status: 'upcoming'  },
];

export const initialAppointments = [
  { id: 1, date: '2026-04-12', time: '10:00 AM', patientName: 'John Doe', type: 'Stent Removal', status: 'Scheduled' },
  { id: 2, date: '2026-04-16', time: '02:30 PM', patientName: 'Harish Kumar', type: 'Consultation', status: 'Scheduled' },
  { id: 3, date: '2026-04-05', time: '11:15 AM', patientName: 'Michael Scott', type: 'Emergency Removal', status: 'Missed' },
];

export const getStatusConfig = () => ({
  overdue:  { label: 'Overdue',  bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-red-500'    },
  upcoming: { label: 'Upcoming', bg: 'bg-amber-100',  text: 'text-amber-600',  dot: 'bg-amber-400'  },
  safe:     { label: 'Active',   bg: 'bg-emerald-100',text: 'text-emerald-600',dot: 'bg-emerald-500' },
});

export const calcDays = (date) => {
  if (!date) return 0;
  const target = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / 86400000);
};

export const calculateDueDate = (insertedDate, months = 3) => {
  if (!insertedDate) return '';
  const date = new Date(insertedDate);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
};
