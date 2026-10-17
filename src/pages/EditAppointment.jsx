
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function EditAppointment() {
    const [access, setAccess] = useState('loading')

    useEffect(() => {
        async function checkAdmin() {
            const { data: { user }, error: authError } =
                await supabase.auth.getUser()

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

            if (profileError || profile?.role !== 'admin') {
                setAccess('denied')
                return
            }

            setAccess('allowed')
        }

        checkAdmin()
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
