import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import InventoryItemForm from '../components/inventory/InventoryItemForm.jsx'
import { AdminPageLayout, AdminPageHeader } from '../components/admin/AdminPageLayout.jsx'
import { AdminErrorState } from '../components/admin/AdminFeedback.jsx'
import { SAMPLE_INVENTORY } from '../mock/inventoryMock.js'

export default function EditInventoryItem() {
  const [searchParams] = useSearchParams()
  const item = SAMPLE_INVENTORY.find((record) => record.id === searchParams.get('id'))

  if (!item) {
    return (
      <AdminPageLayout header={<Header role="admin" isHome={false} />}>
        <div className="mx-auto w-full max-w-3xl">
          <AdminPageHeader title="Edit inventory item" />
          <AdminErrorState>
            <p>Inventory item not found. Choose an item from the inventory list.</p>
            <Link
              to="/viewinventory"
              className="mt-3 inline-flex min-h-11 items-center font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Back to Inventory
            </Link>
          </AdminErrorState>
        </div>
      </AdminPageLayout>
    )
  }

  return (
    <InventoryItemForm
      key={item.id}
      title="Edit inventory item"
      submitLabel="Save changes"
      initialItem={item}
    />
  )
}
