// GP-268 UI fixtures only; these records are never loaded from or saved to a backend.
export const customersMock = [
  {
    id: 'john-doe',
    firstName: 'John',
    lastName: 'Doe',
    joined: 'Sep 22, 2026',
    email: 'john.doe@example.com',
    phone: '(831) 555-0111',
    vehicles: ['BMW', 'Honda', 'Chevrolet'],
    completedJobs: 5,
  },
  {
    id: 'maria-reyes',
    firstName: 'Maria',
    lastName: 'Reyes',
    joined: 'Jul 11, 2026',
    email: 'maria.reyes@example.com',
    phone: '(831) 555-0148',
    vehicles: ['Honda', 'Ford'],
    completedJobs: 7,
  },
]
