import { useMemo, useState } from 'react'
import Header from '../components/layout/Header.jsx'
import AdminDataToolbar from '../components/admin/AdminDataToolbar.jsx'
import AdminDataTable from '../components/admin/AdminDataTable.jsx'
import AdminPagination from '../components/admin/AdminPagination.jsx'
import AdminSearchInput from '../components/admin/AdminSearchInput.jsx'
import { AdminPageLayout, AdminPageHeader } from '../components/admin/AdminPageLayout.jsx'
import { SAMPLE_SERVICES } from '../mock/servicesMock.js'

const PAGE_SIZE = 6

const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)

const columns = [
  { key: 'name', header: 'Service' },
  { key: 'description', header: 'Description' },
  {
    key: 'duration_Minutes',
    header: 'Duration',
    render: (service) => `${service.duration_Minutes} min`,
  },
  {
    key: 'price',
    header: 'Price',
    render: (service) => formatPrice(service.price),
  },
  {
    key: 'status',
    header: 'Status',
    render: (service) => (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
          service.status === 'Active'
            ? 'bg-[#e7f4ec] text-[#21633b]'
            : 'bg-[#eeeeee] text-[#626262]'
        }`}
      >
        {service.status}
      </span>
    ),
  },
]

export default function ViewServices() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('name')
  const [page, setPage] = useState(1)

  const filteredServices = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return SAMPLE_SERVICES
      .filter((service) => status === 'all' || service.status.toLowerCase() === status)
      .filter((service) =>
        !normalizedSearch ||
        `${service.name} ${service.description}`.toLowerCase().includes(normalizedSearch),
      )
      .sort((first, second) => {
        if (sort === 'price-ascending') return first.price - second.price
        if (sort === 'price-descending') return second.price - first.price
        return first.name.localeCompare(second.name)
      })
  }, [search, sort, status])

  const pageCount = Math.max(1, Math.ceil(filteredServices.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visibleServices = filteredServices.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  const updateSearch = (value) => {
    setSearch(value)
    setPage(1)
  }

  const updateStatus = (value) => {
    setStatus(value)
    setPage(1)
  }

  const updateSort = (value) => {
    setSort(value)
    setPage(1)
  }

  return (
    <AdminPageLayout header={<Header role="admin" isHome={false} />}>
      <AdminPageHeader
        title="Services"
        action={
          <a
            href="/addservices"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#323232] px-6 py-3 font-semibold text-white"
          >
            Add service
          </a>
        }
      >
        <AdminPagination
          page={currentPage}
          pageSize={PAGE_SIZE}
          totalCount={filteredServices.length}
          onPageChange={setPage}
          itemLabel="services"
          ariaLabel="Service table pagination"
        />
      </AdminPageHeader>

      <AdminDataToolbar
        className="mb-4"
        filters={
          <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-[minmax(13rem,0.8fr)_minmax(11rem,0.8fr)_minmax(16rem,1.4fr)]">
            <label className="block">
              <span className="sr-only">Filter services by status</span>
              <select
                aria-label="Filter services by status"
                value={status}
                onChange={(event) => updateStatus(event.target.value)}
                className="min-h-11 w-full rounded-lg border border-[#cccccc] bg-white px-3.5 py-2 text-sm text-[#242424] focus:border-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]/20"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="block">
              <span className="sr-only">Sort services</span>
              <select
                aria-label="Sort services"
                value={sort}
                onChange={(event) => updateSort(event.target.value)}
                className="min-h-11 w-full rounded-lg border border-[#cccccc] bg-white px-3.5 py-2 text-sm text-[#242424] focus:border-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]/20"
              >
                <option value="name">Name: A to Z</option>
                <option value="price-ascending">Price: Low to high</option>
                <option value="price-descending">Price: High to low</option>
              </select>
            </label>
            <AdminSearchInput
              label="Search services"
              placeholder="Search services"
              value={search}
              onChange={updateSearch}
            />
          </div>
        }
      />

      <AdminDataTable
        rows={visibleServices}
        columns={columns}
        emptyMessage="No services match your search and filters."
        actions={(service) => (
          <a
            href="/editservices"
            aria-label={`Edit ${service.name}`}
            className="inline-flex min-h-9 items-center justify-center rounded-full border border-[#767676] px-4 text-sm font-semibold text-[#323232] hover:bg-[#ececea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#323232]"
          >
            Edit
          </a>
        )}
      />
    </AdminPageLayout>
  )
}
