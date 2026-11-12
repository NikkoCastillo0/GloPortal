import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import NextAppointmentCard from '../components/dashboard/NextAppointmentCard.jsx'
import VehicleCard from '../components/dashboard/VehicleCard.jsx'
import QuickActions from '../components/dashboard/QuickActions.jsx'
import RecentActivity from '../components/dashboard/RecentActivity.jsx'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function CustomerPortal() {
  const [dashboardData, setDashboardData] = useState({
    nextAppointment: null,
    vehicle: null,
    recentActivities: [],
  })
  const [isDashboardLoading, setIsDashboardLoading] = useState(true)
  const [accessStatus, setAccessStatus] = useState('loading')
  const navigate = useNavigate()

  const loadDashboardData = useCallback(async () => {
    setIsDashboardLoading(true)
    try {
      //get the currently signed in user
      const {data: userData, error: userError} = await supabase.auth.getUser()

      if(userError) throw userError

      const user=userData.user
      if(!user) throw new Error('No user is currently signed in.')

      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select(`
          id,
          starts_at,
          ends_at,
          status,
          vehicles ( make, model, year, license_plate ),
          services ( name )
        `)
        .eq('customer_id', user.id)
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (appointmentError) throw appointmentError

      setDashboardData({
        nextAppointment: appointment
          ? {
              serviceName: appointment.services?.name ?? 'Service',
              date: new Date(appointment.starts_at).toLocaleDateString(),
              time: new Date(appointment.starts_at).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              }),
              status: appointment.status,
            }
          : null,
        vehicle: appointment?.vehicles
          ? {
              year: appointment.vehicles.year,
              make: appointment.vehicles.make,
              model: appointment.vehicles.model,
              licensePlate: appointment.vehicles.license_plate,
            }
          : null,
        recentActivities: [],
      })
    } catch (error) {
      console.error('Failed to load customer dashboard:', error)
    } finally {
      setIsDashboardLoading(false)
    }
    }, [])

  useEffect(() => {
    let active = true
    let verificationId = 0

    async function verifyCustomer() {
      const currentVerification = ++verificationId

      if (active) {
        setAccessStatus('loading')
      }

      try {
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (!active || currentVerification !== verificationId) return

        if (userError || !userData.user) {
          navigate('/login', { replace: true })
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userData.user.id)
          .single()

        if (!active || currentVerification !== verificationId) return

        if (profileError) {
          setAccessStatus('denied')
          return
        }

        if (profile?.role === 'admin') {
          navigate('/adminportal', { replace: true })
          return
        }

        if (profile?.role !== 'customer') {
          setAccessStatus('denied')
          return
        }

        setAccessStatus('authorized')
        await loadDashboardData()
      } catch (error) {
        console.error('Customer verification failed:', error)
        if (active && currentVerification === verificationId) {
          setAccessStatus('denied')
        }
      }
    }

    verifyCustomer()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return

      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login', { replace: true })
        return
      }

      queueMicrotask(() => {
        if (active) {
          verifyCustomer()
        }
      })
    })

    return () => {
      active = false
      verificationId++
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [navigate, loadDashboardData])

  if (accessStatus === 'loading') {
    return (
      <>
        <Header role="customer" isSignedIn={true} showNavigation={true} />
        <main className="mx-auto max-w-7xl px-4 py-12 text-center" aria-busy="true">
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
            Verifying account access...
          </p>
        </main>
      </>
    )
  }

  if (accessStatus === 'denied') {
    return (
      <>
        <Header role="customer" isSignedIn={false} showNavigation={false} />
        <main className="mx-auto max-w-7xl px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Access Denied</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            This page is intended for registered customer accounts.
          </p>
          <a
            href="/login"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[#323232] px-6 py-3 font-semibold text-white transition-colors hover:bg-black"
          >
            Go to Log In
          </a>
        </main>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header role="customer" isSignedIn={true} showNavigation={false} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#323232] sm:text-4xl">
            Customer Dashboard
          </h1>
        </header>

        {/* Primary Dashboard Section - Next Appointment & My Vehicles (Figma Page 25) */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <NextAppointmentCard
            appointment={dashboardData.nextAppointment}
            isLoading={isDashboardLoading}
            onViewDetails={() => {}}
          />
          <VehicleCard
            vehicle={dashboardData.vehicle}
            isLoading={isDashboardLoading}
            onViewAll={() => {}}
          />
        </div>

        {/* Secondary Dashboard Section - Quick Actions & Recent Activity (Figma Page 25) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <QuickActions />
          <RecentActivity activities={dashboardData.recentActivities} />
        </div>
      </main>
    </div>
  )
}
