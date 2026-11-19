import Header from '../components/layout/Header.jsx'
import { AdminPageLayout, AdminPageHeader } from '../components/admin/AdminPageLayout.jsx'
import { useNavigate } from 'react-router-dom'

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
                    <label for="name" className="block text-lg font-bold text-gray-700">Service Name</label>
                    <input id="name" type ="text" placeholder = "Enter service name" className = "w-full border border-gray-400 p-2 rounded" />
                    <label for="name" className="block text-lg font-bold text-gray-700">Description</label>
                    <input id="description" type ="text" placeholder = "Enter a description" className = "w-full border border-gray-400 p-2 rounded" />
                    <label for="name" className="block text-lg font-bold text-gray-700">Status</label>
                    <select id ="status" className = "w-full border border-gray-400 p-2 rounded">
                        <option value="" disabled selected>Select Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <label for="name" className="block text-lg font-bold text-gray-700">Duration (minutes)</label>
                    <input id="duration_minutes" type ="text" placeholder = "Enter time duration" className = "w-full border border-gray-400 p-2 rounded" />
                    <label for="name" className="block text-lg font-bold text-gray-700">Cost ($USD)</label>
                    <input id="price" type ="text" placeholder = "Enter a price" className = "w-full border border-gray-400 p-2 rounded" />
                    <div className="py-5 sm:grid grid-cols-[minmax(13rem,0.8fr)_minmax(16rem,1.4fr)] gap-3 lg:grid-cols-[minmax(13rem,15rem)_minmax(16rem,20rem)] justify-end">
                        <button className = " text-black px-4 py-2 rounded border border-gray-400 cursor-pointer" onClick={() => {navigate("/viewservices")}}>Cancel</button>
                        <button className = "bg-[#323232] text-white px-4 py-2 rounded border cursor-pointer" onClick={() => {navigate("/viewservices")}}>Add Service</button>
                    </div>
                </div>
              </div>
        </AdminPageLayout>
    )
}