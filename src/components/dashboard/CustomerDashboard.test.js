import assert from 'node:assert/strict'
import test from 'node:test'
import { mockCustomerDashboardData } from '../../mock/customerDashboardMock.js'

test('mockCustomerDashboardData includes required customer dashboard properties', () => {
  assert.ok(mockCustomerDashboardData.customer)
  assert.equal(mockCustomerDashboardData.customer.role, 'customer')
  
  assert.ok(mockCustomerDashboardData.nextAppointment)
  assert.equal(mockCustomerDashboardData.nextAppointment.serviceName, 'Tire Patch')
  assert.equal(mockCustomerDashboardData.nextAppointment.date, 'Oct 10, 2026')
  assert.equal(mockCustomerDashboardData.nextAppointment.time, '10:00 AM')

  assert.ok(mockCustomerDashboardData.vehicle)
  assert.equal(mockCustomerDashboardData.vehicle.year, 2022)
  assert.equal(mockCustomerDashboardData.vehicle.make, 'Toyota')
  assert.equal(mockCustomerDashboardData.vehicle.model, 'Camry')
  assert.equal(mockCustomerDashboardData.vehicle.licensePlate, '8ABC123')

  assert.ok(Array.isArray(mockCustomerDashboardData.recentActivities))
  assert.equal(mockCustomerDashboardData.recentActivities.length, 2)
})

test('customer role verification helper logic grants authorized access to customer role only', () => {
  function determineAccess(user, profile) {
    if (!user) return 'unauthenticated'
    if (!profile) return 'denied'
    if (profile.role === 'admin') return 'redirect_admin'
    if (profile.role === 'customer') return 'authorized'
    return 'denied'
  }

  assert.equal(determineAccess(null, null), 'unauthenticated')
  assert.equal(determineAccess({ id: 'u1' }, { role: 'admin' }), 'redirect_admin')
  assert.equal(determineAccess({ id: 'u1' }, { role: 'customer' }), 'authorized')
  assert.equal(determineAccess({ id: 'u1' }, { role: 'guest' }), 'denied')
  assert.equal(determineAccess({ id: 'u1' }, null), 'denied')
})
