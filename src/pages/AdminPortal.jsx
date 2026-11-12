import AdminDashboard from '../components/adminDashboard/AdminDashboard.jsx'
import Header from '../components/layout/Header.jsx'
import { useEffect } from 'react'
import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useNavigate } from 'react-router-dom'

export default function AdminPortal() {
    const [accessStatus, setAccessStatus] = useState('Loading')
    const navigate = useNavigate()

    useEffect(() => {
        let active = true;
        let verificationId = 0;

        async function verifyAdmin() {
            const currentVerification = ++verificationId;

            if (active) {
                setAccessStatus('Loading')
            }

            try {
                const { data, error} = await supabase.auth.getUser()

                if (!active || currentVerification !== verificationId) return;

                if (error || !data.user){ //if user is not logged in
                    navigate('/login', { replace: true }) 
                    return;
                }

                const { data: profile, error: profileError} = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single()

                if (!active || currentVerification !== verificationId) return;

                if(profileError){
                    setAccessStatus('Denied')
                    return
                }

                if (profile?.role === 'customer') { // redirect customer to customer portal
                    navigate('/customerportal', {replace:true}) 
                    return
                }

                if (profile?.role !== 'admin') {
                    setAccessStatus('Denied')
                    return
                }

                setAccessStatus('Authorized')
            }
            catch (error) {
                if (active && currentVerification === verificationId) {
                    setAccessStatus('Denied')
                }
            }
        }

        verifyAdmin();

        const { data: authListener } = supabase.auth.onAuthStateChange(() => {
            queueMicrotask(() => {
                if (active) {
                verifyAdmin()
            }
            })
        })

    return () => {
      active = false
      verificationId++
      authListener.subscription.unsubscribe()
    }

    }, [navigate])

    if (accessStatus === 'Loading') return(
        <main>
            <p>Verifying administrator access...</p>
        </main>

    )

    if (accessStatus !== 'Authorized') return(
        <main>
            <h1>Access Denied</h1>
            <p>You do not have permission to access this page.</p>
        </main>
    )

  return (
    <div className="min-h-screen bg-[#f6f6f4] text-[#323232] md:bg-white">
      <Header role="admin" isSignedIn={true} showNavigation={true} />
      <AdminDashboard />
    </div>
  )
}
