
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AppointmentTable() {
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        let active = true

        async function getAppointments() {
            const { data: { user }, error: authError } =
                await supabase.auth.getUser()

            if (!active) return

            if (authError || !user) {
                setLoading(false)
                return
            }

            const { data: profile, error: profileError } =
                await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

            if (!active) return

            if (profileError || profile?.role !== 'admin') {
                setLoading(false)
                return
            }

            setIsAdmin(true)

            const { data, error } = await supabase
                .from('appointments')
                .select(
                    'id, starts_at, ends_at, status, notes, quoted_price_cents'
                )
                .order('starts_at', { ascending: true })

            if (!active) return

            if (error) {
                console.error(error)
                setErrorMessage('Unable to load appointments.')
            } else {
                setAppointments(data ?? [])
            }

            setLoading(false)
        }

        getAppointments()

        return () => {
            active = false
        }
    }, [])

    if (loading) {
        return <p>Loading appointments...</p>
    }

    if (!isAdmin) {
        return <p>Only administrators can view appointment records.</p>
    }

    if (errorMessage) {
        return <p role="alert">{errorMessage}</p>
    }

    return (
        <div>
            <h2>Appointment Records</h2>

            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Status</th>
                        <th>Price</th>
                        <th>Notes</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {appointments.map((row) => (
                        <tr key={row.id}>
                            <td>
                                {new Date(row.starts_at).toLocaleDateString()}
                            </td>

                            <td>
                                {new Date(row.starts_at).toLocaleTimeString()}
                            </td>

                            <td>
                                {new Date(row.ends_at).toLocaleTimeString()}
                            </td>

                            <td>{row.status}</td>

                            <td>
                                {row.quoted_price_cents == null
                                    ? 'Not quoted'
                                    : `$${(row.quoted_price_cents / 100).toFixed(2)}`}
                            </td>

                            <td>{row.notes || 'No notes'}</td>

                            <td>
                                <button
                                    type="button"
                                    onClick={() => {
                                        window.location.href =
                                            `/appointments/${row.id}/edit`
                                    }}
                                >
                                    Edit Appointment
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {appointments.length === 0 && (
                <p>No appointments found.</p>
            )}
        </div>
    )
}
