import Header from '../components/layout/Header.jsx'
import { AdminPageLayout, AdminPageHeader } from '../components/admin/AdminPageLayout.jsx'
import { useNavigate } from 'react-router-dom'
import { FormField, SelectInput, TextInput, TextArea, AdminFormActions } from '../components/admin/AdminFormControls.jsx'
import { customersMock } from '../mock/customersMock.js'
import { SAMPLE_SERVICES } from '../mock/servicesMock.js'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function EditAppointment() {
    const [access, setAccess] = useState('loading')
    const navigate = useNavigate()

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

    // note the sampel data on this page is hardcoded compared to the create appointment page
    // to show that the edit appointment page is pre-populated 
    return (
        <AdminPageLayout header={<Header role="admin" isHome={false} />}>
                    <AdminPageHeader title="Edit Appointment"></AdminPageHeader>
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="px-4 py-5 sm:p-6 grid min-w-0 grid-cols-1 gap-3 lg:grid-cols">
                            <FormField label="Customer">    
                                <SelectInput id="customer">
                                    <option value="" disabled>Select Customer</option>
                                    <option value="" selected>Nikko Castillo</option>
                                    <option value="">John Doe</option>
                                </SelectInput>
                            </FormField>
                            <FormField label="Vehicle">
                                <SelectInput id="vehicle">
                                    <option value="" disabled>Select Vehicle</option>
                                    <option value="" selected>2022 Toyota Tacoma</option>
                                    <option value="" >2021 Honda Civic</option>
                                </SelectInput>
                            </FormField>
                            <FormField label="Service">
                        <SelectInput id="service">
                            <option value="" disabled selected>Select Service</option>
                            {SAMPLE_SERVICES.map((service) => (
                                <option key={service.id} value={service.id} selected>
                                    {service.name}
                                </option>
                                ))}
                            </SelectInput>
                    </FormField>
                            <div className="grid sm: grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Date">
                                    <TextInput id="date" type="date" value="2026-12-15" />
                                </FormField>
                                <FormField label="Time">
                                    <TextInput id="time" type="time" value="10:00"/>
                                </FormField>
                            </div>
                            <FormField label="Appointment Status">
                                <SelectInput id="status">
                                    <option value="" disabled selected>Select Status</option>
                                    <option value="confirmed" selected>Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="denied">Denied</option>
                                </SelectInput>
                            </FormField>
                            <FormField label="Notes">
                                <TextArea id="notes" placeholder="Add notes(optional)" value="New tires(4). Road force balance."/>
                            </FormField>
                            <FormField>
                                <AdminFormActions
                                    onCancel={() => navigate('/viewappointments')}
                                />
                            </FormField>
                        </div>
                    </div>
                </AdminPageLayout>
    )
}
