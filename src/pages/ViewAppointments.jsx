
import { useEffect, useState } from 'react'

import Header from '../components/home/Header.jsx'
import AppointmentFilters from '../components/viewAppointments/AppointmentFilters.jsx'
import AppointmentPagination from '../components/viewAppointments/AppointmentPagination.jsx'
import AppointmentTable from '../components/viewAppointments/AppointmentTable.jsx'
import { supabase } from '../lib/supabase.js'

export default function ViewAppointments() {
    const [accessStatus, setAccessStatus] = useState('loading')

    useEffect(() => {
        let active = true
        let verificationId = 0

        async function verifyAdmin() {
            const currentVerification = ++verificationId

            if (active) {
                setAccessStatus('loading')
            }

            try {
                const { data: userData, error: userError } =
                    await supabase.auth.getUser()

                if (!active || currentVerification !== verificationId) {
                    return
                }

                if (userError || !userData.user) {
                    setAccessStatus('denied')
                    return
                }

                const { data: profile, error: profileError } =
                    await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', userData.user.id)
                        .single()

                if (!active || currentVerification !== verificationId) {
                    return
                }

                if (profileError || profile?.role !== 'admin') {
                    setAccessStatus('denied')
                    return
                }

                setAccessStatus('authorized')
            } catch (error) {
                console.error('Admin verification failed:', error)

                if (active && currentVerification === verificationId) {
                    setAccessStatus('denied')
                }
            }
        }

        verifyAdmin()

        const { data: authListener } =
            supabase.auth.onAuthStateChange(() => {
                // Schedule verification outside the auth callback.
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
    }, [])

    if (accessStatus === 'loading') {
        return (
            <main>
                <p>Verifying administrator access...</p>
            </main>
        )
    }

    if (accessStatus !== 'authorized') {
        return (
            <main>
                <h1>Access Denied</h1>
                <p>
                    You must be signed in as an administrator
                    to view all appointment records.
                </p>
            </main>
        )
    }

    return (
        <>
            <Header
                role="admin"
                isHome={false}
                isSignedIn={true}
            />

            <main>
                <h1>View All Appointment Records</h1>

                <AppointmentFilters />

                <AppointmentPagination />

                <AppointmentTable />
            </main>
        </>
    )
}
