// Set a destination only after its customer page and route are available.
// Null destinations remain non-interactive and display "Coming soon".
export const customerNavigationItems = [
  { id: 'dashboard', label: 'Customer Dashboard', to: '/customerportal' },
  { id: 'next-appointment', label: 'View Next Appointment', to: null },
  { id: 'vehicles', label: 'My Vehicles', to: null },
  { id: 'booking', label: 'Book Appointment', to: '/monthlybooking' },
  { id: 'add-vehicle', label: 'Add Vehicle', to: null },
  { id: 'profile', label: 'Edit Profile', to: null },
]
