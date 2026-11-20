import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../layout/Header.jsx'
import { AdminPageLayout, AdminPageHeader } from '../admin/AdminPageLayout.jsx'
import { FormField, TextInput, AdminFormActions } from '../admin/AdminFormControls.jsx'
import { AdminNotice } from '../admin/AdminFeedback.jsx'

// GP-302: one shared layout for blank Add and prefilled Edit customer forms.
export default function CustomerForm({ customer }) {
  const isEditing = Boolean(customer)
  const title = isEditing ? 'Edit customer' : 'Add customer'
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <AdminPageLayout header={<Header role="admin" isHome={false} />}>
      <AdminPageHeader title={title} />
      <div className="mx-auto w-full max-w-[800px] space-y-5">
        <AdminNotice tone="info">
          UI preview only. Customer details are not saved.
        </AdminNotice>
        <form
          aria-label={title}
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-[#dedede] bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="grid min-w-0 gap-5 sm:grid-cols-2">
            <FormField label="First name" htmlFor="customer-first-name">
              <TextInput
                id="customer-first-name"
                name="firstName"
                autoComplete="given-name"
                defaultValue={customer?.firstName ?? ''}
              />
            </FormField>
            <FormField label="Last name" htmlFor="customer-last-name">
              <TextInput
                id="customer-last-name"
                name="lastName"
                autoComplete="family-name"
                defaultValue={customer?.lastName ?? ''}
              />
            </FormField>
            <FormField label="Email" htmlFor="customer-email">
              <TextInput
                id="customer-email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={customer?.email ?? ''}
              />
            </FormField>
            <FormField label="Phone" htmlFor="customer-phone">
              <TextInput
                id="customer-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                defaultValue={customer?.phone ?? ''}
              />
            </FormField>
          </div>
          <AdminFormActions
            onCancel={() => navigate('/viewcustomers')}
            submitLabel={isEditing ? 'Save changes' : 'Add customer'}
          />
          {submitted && (
            <AdminNotice tone="info">
              Preview only — no customer details were saved.
            </AdminNotice>
          )}
        </form>
      </div>
    </AdminPageLayout>
  )
}
