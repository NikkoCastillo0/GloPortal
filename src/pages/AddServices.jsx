import Header from '../components/layout/Header.jsx'
import { AdminPageLayout, AdminPageHeader } from '../components/admin/AdminPageLayout.jsx'
import { useNavigate } from 'react-router-dom'
import { FormField, TextInput, SelectInput, AdminFormActions} from '../components/admin/AdminFormControls.jsx'

export default function AddServices() {
    const navigate = useNavigate()

    return (
        <AdminPageLayout header={<Header role="admin" isHome={false} />}>
              <AdminPageHeader
                title="Add Services"
              >
              </AdminPageHeader>

              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:p-6 grid min-w-0 grid-cols-1 gap-3 lg:grid-cols">
                    <FormField label="Service Name">
                        <TextInput id="name" type="text" placeholder="Enter service name" />
                    </FormField>
                    <FormField label="Description">
                        <TextInput id="description" type="text" placeholder="Enter a description" />
                    </FormField>
                    <FormField label="Status">
                        <SelectInput id="status">
                            <option value="" disabled selected>Select Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </SelectInput>
                    </FormField>
                    <FormField label="Duration (minutes)">
                        <TextInput id="duration_minutes" type="text" placeholder="Enter time duration" />
                    </FormField>
                    <FormField label="Cost ($USD)">
                        <TextInput id="price" type="text" placeholder="Enter a price" />
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