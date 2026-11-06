import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import NextAppointmentCard from '../components/dashboard/NextAppointmentCard.jsx'
import VehicleCard from '../components/dashboard/VehicleCard.jsx'
import QuickActions from '../components/dashboard/QuickActions.jsx'
import RecentActivity from '../components/dashboard/RecentActivity.jsx'
import { mockCustomerDashboardData } from '../mock/customerDashboardMock.js'
import { supabase } from '../lib/supabase.js'

export default function CustomerPortal() {
  const [accessStatus, setAccessStatus] = useState('loading')
  const navigate = useNavigate()

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
  }, [navigate])

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

  const { nextAppointment, vehicle, recentActivities } = mockCustomerDashboardData

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
            appointment={nextAppointment}
            onViewDetails={() => {}}
          />
          <VehicleCard
            vehicle={vehicle}
            onViewAll={() => {}}
          />
        </div>

        {/* Secondary Dashboard Section - Quick Actions & Recent Activity (Figma Page 25) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <QuickActions />
          <RecentActivity activities={recentActivities} />
        </div>
      </main>
    </div>
  )
}
