import { useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../layout/Header.jsx'
import { AdminPageLayout, AdminPageHeader } from '../admin/AdminPageLayout.jsx'
import { FormField, TextInput, AdminFormActions } from '../admin/AdminFormControls.jsx'
import { AdminNotice } from '../admin/AdminFeedback.jsx'

export default function InventoryItemForm({ title, submitLabel, initialItem }) {
  const fieldId = useId()
  const navigate = useNavigate()
  const [values, setValues] = useState(() => ({
    name: initialItem?.name ?? '',
    quantity: initialItem ? String(initialItem.quantity) : '',
    lastRestock: initialItem?.lastRestock ?? '',
    purchaseUrl: initialItem?.purchaseUrl ?? '',
  }))
  const [submitted, setSubmitted] = useState(false)

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setSubmitted(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <AdminPageLayout header={<Header role="admin" isHome={false} />}>
      <div className="mx-auto w-full max-w-3xl">
        <AdminPageHeader title={title} />

        <form
          aria-label={title}
          onSubmit={handleSubmit}
          className="grid min-w-0 gap-6 rounded-xl border border-[#dedede] bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="grid min-w-0 gap-5 sm:grid-cols-2">
            <div className="min-w-0 sm:col-span-2">
              <FormField label="Item Name" htmlFor={`${fieldId}-name`}>
                <TextInput
                  id={`${fieldId}-name`}
                  name="name"
                  value={values.name}
                  onChange={handleFieldChange}
                />
              </FormField>
            </div>

            <FormField label="Amount" htmlFor={`${fieldId}-quantity`} hint="Whole items, 0 or more.">
              <TextInput
                id={`${fieldId}-quantity`}
                name="quantity"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={values.quantity}
                onChange={handleFieldChange}
                className="min-w-0"
              />
            </FormField>

            <FormField label="Last Restock" htmlFor={`${fieldId}-last-restock`}>
              <TextInput
                id={`${fieldId}-last-restock`}
                name="lastRestock"
                type="date"
                value={values.lastRestock}
                onChange={handleFieldChange}
                className="min-w-0"
              />
            </FormField>

            <div className="min-w-0 sm:col-span-2">
              <FormField label="Purchase Link" htmlFor={`${fieldId}-purchase-url`}>
                <TextInput
                  id={`${fieldId}-purchase-url`}
                  name="purchaseUrl"
                  type="url"
                  value={values.purchaseUrl}
                  onChange={handleFieldChange}
                  className="min-w-0"
                />
              </FormField>
            </div>
          </div>

          {submitted && (
            <AdminNotice tone="info">
              This is a preview. No inventory changes have been saved.
            </AdminNotice>
          )}

          <AdminFormActions
            onCancel={() => navigate('/viewinventory')}
            submitLabel={submitLabel}
            className="[&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-4 [&_button]:focus-visible:outline-[#323232]"
          />
        </form>
      </div>
    </AdminPageLayout>
  )
}
