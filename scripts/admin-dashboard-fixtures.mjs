// Synthetic test records, never production shop data.
export const dashboardSummary = {
  todayCount: 3,
  todayAppointments: [
    { id: 'appointment-1', startsAt: '2026-11-09T18:00:00Z', serviceName: 'Tire Patch' },
    { id: 'appointment-2', startsAt: '2026-11-09T22:00:00Z', serviceName: 'TPMS Service' },
  ],
  customerCount: 128,
  vehicleCount: 96,
  lowestStock: [
    { id: 'item-1', name: 'TPMS Sensors', quantity: 3 },
    { id: 'item-2', name: 'Valve Stems', quantity: 17 },
  ],
  activeServiceCount: 4,
  popularService: 'Tire Patch',
  pendingCount: 6,
}

export const emptyDashboardSummary = {
  todayCount: 0,
  todayAppointments: [],
  customerCount: 0,
  vehicleCount: 0,
  lowestStock: [],
  activeServiceCount: 0,
  popularService: null,
  pendingCount: 0,
}
