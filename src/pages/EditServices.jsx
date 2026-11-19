import Header from '../components/layout/Header.jsx'
import { AdminPageLayout, AdminPageHeader } from '../components/admin/AdminPageLayout.jsx'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

// sample data for demonstration
const SAMPLE_SERVICES = [
  {
    id: 'tire-mount-balance',
    name: 'Tire Mount and Balance',
    description: 'Tire mounting and balancing for a smoother ride.',
    duration_Minutes: 60,
    price: 25,
    status: 'Active',
  },
  {
    id: 'tire-plug-patch',
    name: 'Tire Plug/Patch',
    description: 'Repair for safely repairable tire punctures.',
    duration_Minutes: 45,
    price: 20,
    status: 'Active',
  },
  {
    id: 'wheel-balancing',
    name: 'Wheel Balancing',
    description: 'Correct uneven wheel weight distribution.',
    duration_Minutes: 45,
    price: 15,
    status: 'Active',
  },
  {
    id: 'tpms-service',
    name: 'TPMS Service',
    description: 'Inspection and service for tire pressure sensors.',
    duration_Minutes: 45,
    price: 30,
    status: 'Active',
  },
  {
    id: 'tire-rotation',
    name: 'Tire Rotation',
    description: 'Rotate tires to support even tread wear.',
    duration_Minutes: 30,
    price: 20,
    status: 'Active',
  },
  {
    id: 'flat-tire-inspection',
    name: 'Flat Tire Inspection',
    description: 'Inspect a flat tire and assess repair options.',
    duration_Minutes: 20,
    price: 10,
    status: 'Inactive',
  },
  {
    id: 'seasonal-tire-change',
    name: 'Seasonal Tire Change',
    description: 'Swap a vehicle between seasonal tire sets.',
    duration_Minutes: 60,
    price: 40,
    status: 'Active',
  },
  {
    id: 'tire-disposal',
    name: 'Tire Disposal',
    description: 'Responsible disposal of an old tire.',
    duration_Minutes: 15,
    price: 5,
    status: 'Inactive',
  },
]

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
                    <label htmlFor="name" className="block text-lg font-bold text-gray-700">Select A Service</label>
                    <select id="name" value={form.id} className="w-full border border-gray-400 p-2 rounded" onChange={handleServiceChange}>
                        {SAMPLE_SERVICES.map((service) => (
                            <option key={service.id} value={service.id}>
                                {service.name}
                            </option>
                        ))}
                    </select>
                    <label htmlFor="description" className="block text-lg font-bold text-gray-700">Description</label>
                    <input id="description" name="description" type="text" placeholder="Enter a description" value={form.description} onChange={handleFieldChange} className="w-full border border-gray-400 p-2 rounded" />
                    <label htmlFor="status" className="block text-lg font-bold text-gray-700">Status</label>
                    <select id="status" name="status" value={form.status.toLowerCase()} onChange={(event) => setForm((currentForm) => ({ ...currentForm, status: event.target.value === 'active' ? 'Active' : 'Inactive' }))} className="w-full border border-gray-400 p-2 rounded">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <label htmlFor="duration_minutes" className="block text-lg font-bold text-gray-700">Duration (minutes)</label>
                    <input id="duration_minutes" name="duration_Minutes" type="text" placeholder="Enter time duration" value={form.duration_Minutes} onChange={handleFieldChange} className="w-full border border-gray-400 p-2 rounded " />
                    <label htmlFor="price" className="block text-lg font-bold text-gray-700">Cost ($USD)</label>
                    <input id="price" name="price" type="text" placeholder="Enter a price" value={form.price} onChange={handleFieldChange} className="w-full border border-gray-400 p-2 rounded" />
                    <div className="py-5 sm:grid grid-cols-[minmax(13rem,0.8fr)_minmax(16rem,1.4fr)] gap-3 lg:grid-cols-[minmax(13rem,15rem)_minmax(16rem,20rem)] justify-end">
                        <button className = " text-black px-4 py-2 rounded border border-gray-400 cursor-pointer" onClick={() => {navigate("/viewservices")}}>Cancel</button>
                        <button className = "bg-[#323232] text-white px-4 py-2 rounded border cursor-pointer" onClick={() => {navigate("/viewservices")}}>Save Changes</button>
                    </div>
                </div>
              </div>
        </AdminPageLayout>
    )
}