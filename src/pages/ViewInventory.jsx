import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import AdminDataTable from '../components/admin/AdminDataTable.jsx'
import AdminDataToolbar from '../components/admin/AdminDataToolbar.jsx'
import AdminPagination from '../components/admin/AdminPagination.jsx'
import AdminSearchInput from '../components/admin/AdminSearchInput.jsx'
import { AdminPageLayout, AdminPageHeader } from '../components/admin/AdminPageLayout.jsx'
import { SelectInput, TextInput } from '../components/admin/AdminFormControls.jsx'
import { SAMPLE_INVENTORY } from '../mock/inventoryMock.js'

const restockDateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

function RestockDate({ value }) {
  return <time dateTime={value}>{restockDateFormatter.format(new Date(value))}</time>
}

function PurchaseLink({ item }) {
  return (
    <a
      href={item.purchaseUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Purchase ${item.name} (opens in a new tab)`}
      className="wrap-anywhere font-medium text-[#323232] underline underline-offset-4 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      {item.name}
    </a>
  )
}

function EditItemLink({ item }) {
  return (
    <Link
      to={`/editinventoryitem?id=${encodeURIComponent(item.id)}`}
      aria-label={`Edit ${item.name}`}
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#767676] bg-white px-4 text-sm font-semibold text-[#323232] hover:bg-[#ececea] focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      Edit
    </Link>
  )
}

export default function ViewInventory() {
  const [quantities, setQuantities] = useState(() =>
    Object.fromEntries(SAMPLE_INVENTORY.map((item) => [item.id, String(item.quantity)])),
  )
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')

  const renderAmount = (item) => (
    <TextInput
      type="number"
      inputMode="numeric"
      min="0"
      step="1"
      aria-label={`Amount for ${item.name}`}
      value={quantities[item.id]}
      onChange={(event) => {
        const nextQuantity = event.target.value
        setQuantities((current) => ({ ...current, [item.id]: nextQuantity }))
      }}
      className="min-w-0 max-w-28"
    />
  )

  const columns = [
    { key: 'name', header: 'Item Name' },
    { key: 'quantity', header: 'Amount', render: renderAmount },
    {
      key: 'lastRestock',
      header: 'Last Restock',
      render: (item) => <RestockDate value={item.lastRestock} />,
    },
    {
      key: 'purchaseUrl',
      header: 'Purchase Link',
      render: (item) => <PurchaseLink item={item} />,
    },
    { key: 'edit', header: 'Edit', render: (item) => <EditItemLink item={item} /> },
  ]

  return (
    <AdminPageLayout header={<Header role="admin" isHome={false} />}>
      <AdminPageHeader
        title="Inventory"
        description="Current shop supplies and restock information."
        action={
          <Link
            to="/addinventoryitem"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#323232] px-6 py-3 font-semibold text-white hover:bg-[#484848] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#323232] sm:w-auto"
          >
            Add Item
          </Link>
        }
      />

      <AdminDataToolbar
        className="mb-6"
        filters={
          <div className="grid min-w-0 grid-cols-1 gap-3 min-[380px]:grid-cols-2">
            <label className="block min-w-0">
              <span className="sr-only">Filter inventory by amount</span>
              <SelectInput value={filter} onChange={(event) => setFilter(event.target.value)}>
                <option value="">Filter by amount</option>
                <option value="most">Most in stock</option>
                <option value="least">Least in stock</option>
              </SelectInput>
            </label>
            <AdminSearchInput
              label="Search inventory"
              placeholder="Contains"
              value={search}
              onChange={setSearch}
            />
          </div>
        }
        pagination={
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-[#717171] lg:sr-only">Showing results</span>
            <AdminPagination
              page={1}
              pageSize={SAMPLE_INVENTORY.length}
              totalCount={SAMPLE_INVENTORY.length}
              onPageChange={() => undefined}
              itemLabel="inventory"
              ariaLabel="Inventory pagination"
            />
          </div>
        }
      />

      {/* Keep the shared wide table above its minimum width; use cards on tablets too. */}
      <div className="hidden min-w-0 xl:block">
        <AdminDataTable rows={SAMPLE_INVENTORY} columns={columns} emptyMessage="No inventory items found." />
      </div>

      <section aria-label="Inventory items" className="grid min-w-0 gap-3 sm:grid-cols-2 xl:hidden">
        {SAMPLE_INVENTORY.map((item) => (
          <article
            key={item.id}
            aria-labelledby={`inventory-${item.id}`}
            className="min-w-0 rounded-[18px] border border-[#cfcfcd] bg-white p-4"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 id={`inventory-${item.id}`} className="min-w-0 wrap-anywhere text-xl font-bold">
                {item.name}
              </h2>
              <EditItemLink item={item} />
            </div>
            <dl className="grid gap-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <dt className="font-semibold text-[#717171]">Amount</dt>
                <dd className="min-w-0">{renderAmount(item)}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
                <dt className="font-semibold text-[#717171]">Last Restock</dt>
                <dd><RestockDate value={item.lastRestock} /></dd>
              </div>
              <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
                <dt className="font-semibold text-[#717171]">Purchase Link</dt>
                <dd className="min-w-0 max-w-full"><PurchaseLink item={item} /></dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </AdminPageLayout>
  )
}
