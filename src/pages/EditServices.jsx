import Header from '../components/layout/Header.jsx'
import { AdminPageLayout, AdminPageHeader } from '../components/admin/AdminPageLayout.jsx'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { FormField, TextInput, SelectInput, AdminFormActions} from '../components/admin/AdminFormControls.jsx'
import { SAMPLE_SERVICES } from '../mock/servicesMock.js'

export default function EditServices() {
    const navigate = useNavigate()
    const [form, setForm] = useState(SAMPLE_SERVICES[0])

    const handleServiceChange = (event) => {
        const service = SAMPLE_SERVICES.find((sample) => sample.id === event.target.value)
        if (service) {
            setForm(service)
        }
    }

    const handleFieldChange = (event) => {
        const { name, value } = event.target
        setForm((currentForm) => ({ ...currentForm, [name]: value }))
    }

    return (
        <AdminPageLayout header={<Header role="admin" isHome={false} />}>
              <AdminPageHeader
                title="Edit Services"
              >
              </AdminPageHeader>

              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:p-6 grid min-w-0 grid-cols-1 gap-3 lg:grid-cols">
                    <FormField label="Service Name">
                        <SelectInput id="name" value={form.id} onChange={handleServiceChange}>
                            {SAMPLE_SERVICES.map((service) => (
                                <option key={service.id} value={service.id}>
                                    {service.name}
                                </option>
                            ))}
                        </SelectInput>
                    </FormField>
                    <FormField label="Description">
                        <TextInput id="description" type="text" placeholder="Enter a description" value={form.description} onChange={handleFieldChange}/>
                    </FormField>
                    <FormField label="Status">
                        <SelectInput id="status" value={form.status.toLowerCase()} onChange={(event) => setForm((currentForm) => ({ ...currentForm, status: event.target.value === 'active' ? 'Active' : 'Inactive' }))}>
                            <option value="" disabled selected>Select Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </SelectInput>
                    </FormField>
                    <FormField label="Duration (minutes)">
                        <TextInput id="duration_minutes" type="text" placeholder="Enter time duration" value={form.duration_Minutes} onChange={handleFieldChange}/>
                    </FormField>
                    <FormField label="Cost ($USD)">
                        <TextInput id="price" type="text" placeholder="Enter a price" value={form.price} onChange={handleFieldChange}/>
                    </FormField>
                    <FormField>
                        <AdminFormActions
                            onCancel={() => navigate('/viewservices')}
                        />
                    </FormField>
                </div>
              </div>
        </AdminPageLayout>
    )
}