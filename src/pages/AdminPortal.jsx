import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminDashboard from '../components/adminDashboard/AdminDashboard.jsx'
import Header from '../components/layout/Header.jsx'
import SignOutMenuButton from '../components/navigation/SignOutMenuButton.jsx'
import useAdminDashboard from '../hooks/useAdminDashboard.js'
import { supabase } from '../lib/supabase.js'

export default function AdminPortal() {
  const [accessStatus, setAccessStatus] = useState('Loading')
  const { status, summary, handleRefresh } = useAdminDashboard()
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    let verificationId = 0

    async function verifyAdmin() {
      const currentVerification = ++verificationId

      if (active) setAccessStatus('Loading')

      try {
        const { data, error } = await supabase.auth.getUser()

        if (!active || currentVerification !== verificationId) return

        if (error || !data.user) {
          navigate('/login', { replace: true })
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (!active || currentVerification !== verificationId) return

        if (profileError) {
          setAccessStatus('Denied')
          return
        }

        if (profile?.role === 'customer') {
          navigate('/customerportal', { replace: true })
          return
        }

        if (profile?.role !== 'admin') {
          setAccessStatus('Denied')
          return
        }

        setAccessStatus('Authorized')
      } catch {
        if (active && currentVerification === verificationId) {
          setAccessStatus('Denied')
        }
      }
    }

    verifyAdmin()

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      queueMicrotask(() => {
        if (active) verifyAdmin()
      })
    })

    return () => {
      active = false
      verificationId++
      authListener.subscription.unsubscribe()
    }
  }, [navigate])

  if (accessStatus === 'Loading') {
    return (
      <main className="p-6 text-center" aria-busy="true">
        <p role="status">Verifying administrator access…</p>
      </main>
    )
  }

  if (accessStatus !== 'Authorized') {
    return (
      <main className="p-6 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You do not have permission to access this page.</p>
      </main>
    )
  }

  const adminHeader = (
    <Header
      role="admin"
      isSignedIn={true}
      showNavigation={true}
      adminMenuContent={<SignOutMenuButton clearCacheOnSignOut />}
    />
  )

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#f6f6f4] text-[#323232] md:bg-white">
        {adminHeader}
        <main className="mx-auto max-w-3xl px-5 py-12 text-center" aria-busy="true">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-4" role="status">Loading dashboard…</p>
        </main>
      </div>
    )
  }

  if (status === 'denied') {
    return (
      <div className="min-h-screen bg-[#f6f6f4] text-[#323232] md:bg-white">
        {adminHeader}
        <main className="mx-auto max-w-3xl px-5 py-12 text-center">
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="mt-4">Administrator access is required to load this summary.</p>
          <a href="/login" className="mt-4 inline-block font-semibold underline focus-visible:outline-2">
            Go to Log In
          </a>
        </main>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#f6f6f4] text-[#323232] md:bg-white">
        {adminHeader}
        <main className="mx-auto max-w-3xl px-5 py-12 text-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-4" role="alert">We couldn’t load the dashboard. Please try again.</p>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-4 rounded-full bg-[#323232] px-5 py-2 font-semibold text-white hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Try again
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f6f4] text-[#323232] md:bg-white">
      {adminHeader}
      <AdminDashboard summary={summary}>
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-full bg-[#323232] px-5 py-2 font-semibold text-white hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Refresh dashboard
          </button>
        </div>
      </AdminDashboard>
    </div>
  )
}
