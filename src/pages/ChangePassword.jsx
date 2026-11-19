import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import Header from '../components/layout/Header.jsx'
import { Button } from '../components/ui/button.jsx'
import { Input } from '../components/ui/input.jsx'
import { Label } from '../components/ui/label.jsx'
import { supabase } from '../lib/supabase.js'

const passwordFields = [
  { name: 'currentPassword', label: 'Old password', autoComplete: 'current-password' },
  { name: 'newPassword', label: 'New password', autoComplete: 'new-password' },
  { name: 'confirmPassword', label: 'Re-enter new password', autoComplete: 'new-password' },
]

export default function ChangePassword() {
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  function handleFieldChange(event) {
    const { name, value } = event.target
    setPasswords((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (saving) return
    setMessage(null)

    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setMessage({ kind: 'error', text: 'Fill out all three password fields.' })
      return
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ kind: 'error', text: 'The new passwords do not match.' })
      return
    }
    if (passwords.newPassword.length < 6) {
      setMessage({ kind: 'error', text: 'Your new password must be at least 6 characters.' })
      return
    }

    setSaving(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user?.email) throw userError || new Error('Please sign in again.')

      // Use an isolated client so verifying the old password does not replace
      // the active customer's session or trigger the app's sign-in listeners.
      const verifier = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      })
      const { data: verified, error: verificationError } = await verifier.auth.signInWithPassword({
        email: user.email,
        password: passwords.currentPassword,
      })
      if (verificationError || verified.user?.id !== user.id) {
        throw new Error('The old password is incorrect. Please try again.')
      }
      await verifier.auth.signOut({ scope: 'local' })

      const { error } = await supabase.auth.updateUser({
        current_password: passwords.currentPassword,
        password: passwords.newPassword,
      })
      if (error) throw error

      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setMessage({ kind: 'success', text: 'Your password was changed.' })
    } catch (error) {
      setMessage({ kind: 'error', text: error.message || 'Could not change your password. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-svh bg-[#f4f1ef] text-[#242424]">
      <Header role="customer" />
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Change Password</h1>
          <Link to="/customerportal" className="rounded-md text-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#323232]">Back to dashboard</Link>
        </div>

        <form onSubmit={handleSubmit} aria-label="Change password" aria-busy={saving} className="rounded-2xl border border-[#e1deda] bg-white p-5 shadow-sm sm:p-8">
          {message && <p role={message.kind === 'error' ? 'alert' : 'status'} className={`mb-5 text-sm ${message.kind === 'error' ? 'text-red-700' : 'text-green-800'}`}>{message.text}</p>}
          <div className="space-y-5 sm:space-y-6">
            {passwordFields.map(({ name, label, autoComplete }) => (
              <div key={name}>
                <Label htmlFor={name} className="mb-2 block text-sm font-semibold text-[#303030]">{label}</Label>
                <Input
                  id={name}
                  name={name}
                  type="password"
                  autoComplete={autoComplete}
                  value={passwords[name]}
                  onChange={handleFieldChange}
                  disabled={saving}
                  required
                  className="h-11 rounded-lg border-[#d3d5da] bg-[#f7f7f7] px-3 text-base focus-visible:border-[#323232] focus-visible:ring-[#323232]/20"
                />
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-end">
            <Button type="submit" disabled={saving} className="h-11 w-full rounded-lg bg-[#323232] px-6 text-base text-white hover:bg-[#202020] sm:w-auto">
              {saving ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
