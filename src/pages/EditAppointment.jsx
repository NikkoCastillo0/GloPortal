
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function EditAppointment() {
    const [access, setAccess] = useState('loading')

    useEffect(() => {
        let active = true
        let verificationId = 0

        async function checkAdmin() {
            const currentVerification = ++verificationId
            setAccess('loading')

            try {
                const { data: { user }, error: authError } =
                    await supabase.auth.getUser()

                if (!active || currentVerification !== verificationId) return

                if (authError || !user) {
                    setAccess('denied')
                    return
                }

                const { data: profile, error: profileError } =
                    await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single()

                if (!active || currentVerification !== verificationId) return

                setAccess(
                    profileError || profile?.role !== 'admin'
                        ? 'denied'
                        : 'allowed'
                )
            } catch {
                if (active && currentVerification === verificationId) {
                    setAccess('denied')
                }
            }
        }

        const { data: { subscription } } =
            supabase.auth.onAuthStateChange((event, session) => {
                if (!active) return

                const scheduledVerification = ++verificationId

                if (event === 'SIGNED_OUT' || !session) {
                    setAccess('denied')
                    return
                }

                setAccess('loading')
                // Recheck outside the auth callback; ignore superseded events.
                queueMicrotask(() => {
                    if (active && scheduledVerification === verificationId) {
                        checkAdmin()
                    }
                })
            })

        checkAdmin()

        return () => {
            active = false
            verificationId++
            subscription.unsubscribe()
        }
    }, [])

    if (access === 'loading') {
        return <p className="p-6">Checking admin access...</p>
    }

    if (access === 'denied') {
        return (
            <main className="p-6">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p>Only administrators can access this page.</p>
            </main>
        )
    }

    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold">Edit Appointment</h1>
            <p>Appointment management screen</p>
        </main>
    )
}
