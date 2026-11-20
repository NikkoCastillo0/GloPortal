import Header from '../components/layout/Header.jsx'
import { AdminPageLayout, AdminPageHeader } from '../components/admin/AdminPageLayout.jsx'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormField, SelectInput, TextInput, TextArea, AdminFormActions } from '../components/admin/AdminFormControls.jsx'
import { customersMock } from '../mock/customersMock.js'
import { SAMPLE_SERVICES } from '../mock/servicesMock.js'

export function CreateAppointment(){
    const [selectedCustomerId, setSelectedCustomerId] = useState('')
    const [selectedVehicle, setSelectedVehicle] = useState('')
    const selectedCustomer = customersMock.find((customer) => customer.id === selectedCustomerId)
    const navigate = useNavigate()

    const handleCustomerChange = (event) => {
        setSelectedCustomerId(event.target.value)
        setSelectedVehicle('')
    }

    return(
        <AdminPageLayout header={<Header role="admin" isHome={false} />}>
            <AdminPageHeader title="Add Appointment"></AdminPageHeader>
            <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:p-6 grid min-w-0 grid-cols-1 gap-3 lg:grid-cols">
                    <FormField label="Customer">    
                        <SelectInput id="customer" value={selectedCustomerId} onChange={handleCustomerChange}>
                            <option value="" disabled>Select Customer</option>
                            {customersMock.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.firstName} {customer.lastName}
                                </option>
                            ))}
                        </SelectInput>
                    </FormField>
                    <FormField label="Vehicle">
                        <SelectInput
                            id="vehicle"
                            value={selectedVehicle}
                            onChange={(event) => setSelectedVehicle(event.target.value)}
                            disabled={!selectedCustomer}
                        >
                            <option value="" disabled>Select Vehicle</option>
                            {selectedCustomer?.vehicles.map((vehicle) => (
                                <option key={vehicle} value={vehicle}>
                                    {vehicle}
                                </option>
                            ))}
                        </SelectInput>
                    </FormField>
                    <FormField label="Service">
                        <SelectInput id="service">
                            <option value="" disabled selected>Select Service</option>
                            {SAMPLE_SERVICES.map((service) => (
                                <option key={service.id} value={service.id}>
                                    {service.name}
                                </option>
                            ))}
                        </SelectInput>
                    </FormField>
                    <div className="grid sm: grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Date">
                            <TextInput id="date" type="date" />
                        </FormField>
                        <FormField label="Time">
                            <TextInput id="time" type="time" />
                        </FormField>
                    </div>
                    <FormField label="Appointment Status">
                        <SelectInput id="status">
                            <option value="" disabled selected>Select Status</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="denied">Denied</option>
                        </SelectInput>
                    </FormField>
                    <FormField label="Notes">
                        <TextArea id="notes" placeholder="Add notes(optional)" />
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