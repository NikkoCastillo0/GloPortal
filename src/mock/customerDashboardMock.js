export const mockCustomerDashboardData = {
  customer: {
    id: 'mock-cust-001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'jdoe@gmail.com',
    role: 'customer',
  },
  nextAppointment: {
    id: 'apt-001',
    serviceName: 'Tire Patch',
    date: 'Oct 10, 2026',
    time: '10:00 AM',
    status: 'Scheduled',
  },
  vehicle: {
    id: 'veh-001',
    year: 2022,
    make: 'Toyota',
    model: 'Camry',
    licensePlate: '8ABC123',
  },
  recentActivities: [
    {
      id: 'act-1',
      title: 'Appointment Scheduled: Tire Patch - Oct 10, 2026',
      timestamp: '2026-10-01',
    },
    {
      id: 'act-2',
      title: 'Vehicle Added: 2022 Toyota Camry',
      timestamp: '2026-09-22',
    },
  ],
}
