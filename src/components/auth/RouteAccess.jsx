import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'

export default function RouteAccess({ children, requiredRole }) {
  const [access, setAccess] = useState({ status: 'checking' })

  useEffect(() => {
    let active = true
    let verificationId = 0
    let scheduledCheck

    async function verifyAccount() {
      const currentVerification = ++verificationId
      const isCurrent = () => active && currentVerification === verificationId

      try {
        // Match GP-85: verify the user, then read their role from profiles.
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (!isCurrent()) return

        if (authError || !user) {
          setAccess({ status: 'anonymous' })
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        if (!isCurrent()) return

        if (profileError || !['customer', 'admin'].includes(profile?.role)) {
          setAccess({ status: 'unverified' })
          return
        }

        setAccess({ status: 'authenticated', role: profile.role })
      } catch {
        if (isCurrent()) setAccess({ status: 'unverified' })
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      ++verificationId
      clearTimeout(scheduledCheck)

      if (event === 'SIGNED_OUT' || !session) {
        setAccess({ status: 'anonymous' })
        return
      }

      setAccess({ status: 'checking' })
      // Run Supabase calls outside its auth callback to avoid lock contention.
      scheduledCheck = setTimeout(verifyAccount, 0)
    })

    verifyAccount()

    return () => {
      active = false
      ++verificationId
      clearTimeout(scheduledCheck)
      subscription.unsubscribe()
    }
  }, [])

  if (access.status === 'checking') {
    return <main className="p-6" role="status">Checking account access...</main>
  }

  if (access.status === 'unverified') {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>Your account could not be verified. Please try again later.</p>
      </main>
    )
  }

  if (access.status === 'anonymous') {
    return requiredRole ? <Navigate to="/login" replace /> : children
  }

  if (!requiredRole || access.role !== requiredRole) {
    return <Navigate to={access.role === 'admin' ? '/adminportal' : '/customerportal'} replace />
  }

  return children
}
