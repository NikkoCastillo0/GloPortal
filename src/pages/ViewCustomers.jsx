import { useState } from 'react'
import Header from '../components/layout/Header.jsx'
import { AdminPageLayout, AdminPageHeader } from '../components/admin/AdminPageLayout.jsx'
import AdminDataTable from '../components/admin/AdminDataTable.jsx'
import AdminDataToolbar from '../components/admin/AdminDataToolbar.jsx'
import AdminPagination from '../components/admin/AdminPagination.jsx'
import AdminSearchInput from '../components/admin/AdminSearchInput.jsx'
import { SelectInput } from '../components/admin/AdminFormControls.jsx'
import { AdminNotice } from '../components/admin/AdminFeedback.jsx'
import { customersMock } from '../mock/customersMock.js'

const columns = [
  {
    key: 'customer',
    header: 'Customer',
    render: (customer) => (
      <span className="font-semibold">{customer.firstName} {customer.lastName}</span>
    ),
  },
  { key: 'joined', header: 'Joined' },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Phone' },
  {
    key: 'vehicles',
    header: 'Vehicles',
    render: (customer) => `${customer.vehicles.length} · ${customer.vehicles.join(', ')}`,
  },
  { key: 'completedJobs', header: 'Completed Jobs' },
  {
    key: 'edit',
    header: 'Edit',
    render: (customer) => (
      <button
        type="button"
        disabled
        title="Customer forms will be available with GP-302"
        aria-label={`Edit ${customer.firstName} ${customer.lastName}`}
        className="inline-flex min-h-11 items-center rounded-lg border border-[#bdbdbd] bg-white px-4 font-semibold text-[#323232] hover:bg-[#f4f4f4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#323232]"
      >
        Edit
      </button>
    ),
  },
]

// GP-301: UI-only controls retain input without filtering the mock records.
export default function ViewCustomers() {
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('all')

  return (
    <AdminPageLayout header={<Header role="admin" isHome={false} />}>
      <AdminPageHeader
        title="All Customers"
        description="Customer contact, vehicle and job history."
        action={
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled
              title="Customer forms will be available with GP-302"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#323232] px-6 py-3 font-semibold text-white hover:bg-[#484848]"
            >
              Add customer
            </button>
            <button
              type="button"
              disabled
              title="Customer forms will be available with GP-302"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#bdbdbd] bg-white px-6 py-3 font-semibold text-[#323232] hover:bg-[#f4f4f4]"
            >
              Edit Customers
            </button>
          </div>
        }
      />

      <div className="space-y-5">
        <AdminNotice tone="info">
          UI preview: sample customers only. Search, date filters and pagination do not change the displayed records. Add and Edit controls are disabled until the customer forms are added in GP-302.
        </AdminNotice>
        <AdminDataToolbar
          filters={
            <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:max-w-[700px]">
              <label className="block min-w-0">
                <span className="sr-only">Filter customers by joined date</span>
                <SelectInput
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                >
                  <option value="all">Filter by date</option>
                  <option value="newest">Newest joined</option>
                  <option value="oldest">Oldest joined</option>
                </SelectInput>
              </label>
              <AdminSearchInput
                label="Search customers"
                placeholder="Contains"
                value={search}
                onChange={setSearch}
                helpText="UI preview only. Search does not filter the sample customers."
              />
            </div>
          }
          pagination={
            <AdminPagination
              page={1}
              pageSize={6}
              totalCount={customersMock.length}
              onPageChange={() => {}}
              itemLabel="customers"
              ariaLabel="Customer pagination"
            />
          }
        />
        <AdminDataTable rows={customersMock} columns={columns} />
      </div>
    </AdminPageLayout>
  )
}
