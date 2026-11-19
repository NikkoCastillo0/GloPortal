import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import { Button } from '../components/ui/button.jsx'
import { Input } from '../components/ui/input.jsx'
import { Label } from '../components/ui/label.jsx'
import { supabase } from '../lib/supabase.js'

const fields = [
  { name: 'firstName', label: 'First Name', autoComplete: 'given-name' },
  { name: 'lastName', label: 'Last Name', autoComplete: 'family-name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'phone', label: 'Phone Number', type: 'tel', autoComplete: 'tel' },
]

export default function EditProfile() {
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '' })
  const [originalEmail, setOriginalEmail] = useState('')
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    let active = true

    async function loadProfile() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw userError || new Error('Please sign in again.')

        const { data, error } = await supabase.from('profiles')
          .select('first_name, last_name, phone')
          .eq('id', user.id)
          .single()
        if (error) throw error
        if (!active) return

        const email = user.email || ''
        setUserId(user.id)
        setOriginalEmail(email)
        setProfile({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email,
          phone: data.phone || '',
        })
      } catch {
        if (active) setMessage({ kind: 'error', text: 'Could not load your profile. Please try again.' })
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProfile()
    return () => { active = false }
  }, [])

  function handleFieldChange(event) {
    const { name, value } = event.target
    setProfile((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!userId || saving) return

    const firstName = profile.firstName.trim()
    const lastName = profile.lastName.trim()
    const email = profile.email.trim()
    const phone = profile.phone.trim()
    setMessage(null)

    if (!firstName || !lastName || !email || !phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ kind: 'error', text: 'Enter your name, a valid email address, and phone number.' })
      return
    }

    setSaving(true)
    try {
      const { error: profileError } = await supabase.from('profiles')
        .update({ first_name: firstName, last_name: lastName, phone })
        .eq('id', userId)
        .select('id')
        .single()
      if (profileError) throw profileError

      if (email !== originalEmail) {
        const { data: updatedUser, error: emailError } = await supabase.auth.updateUser({ email })
        if (emailError) {
          setMessage({ kind: 'error', text: 'Your name and phone were saved, but the email change failed. Please try again.' })
          return
        }
        if (updatedUser.user?.email === email) {
          setOriginalEmail(email)
          setMessage({ kind: 'success', text: 'Your profile changes were saved.' })
        } else {
          setMessage({ kind: 'success', text: 'Your name and phone were saved. Check your email for a confirmation link to complete the address change.' })
        }
      } else {
        setMessage({ kind: 'success', text: 'Your profile changes were saved.' })
      }
    } catch {
      setMessage({ kind: 'error', text: 'Could not save your profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-svh bg-[#f4f1ef] text-[#242424]">
      <Header role="customer" />
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Edit Profile</h1>
          <Link to="/customerportal" className="rounded-md text-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#323232]">Back to dashboard</Link>
        </div>

        <form onSubmit={handleSubmit} aria-label="Edit profile" aria-busy={saving} className="rounded-2xl border border-[#e1deda] bg-white p-5 shadow-sm sm:p-8">
          {loading ? (
            <p role="status">Loading your profile...</p>
          ) : (
            <>
              {message && <p role={message.kind === 'error' ? 'alert' : 'status'} className={`mb-5 text-sm ${message.kind === 'error' ? 'text-red-700' : 'text-green-800'}`}>{message.text}</p>}
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                {fields.map(({ name, label, type = 'text', autoComplete }) => (
                  <div key={name} className={name === 'email' || name === 'phone' ? 'sm:col-span-2' : ''}>
                    <Label htmlFor={`profile-${name}`} className="mb-2 block text-sm font-semibold text-[#303030]">{label}</Label>
                    <Input
                      id={`profile-${name}`}
                      name={name}
                      type={type}
                      autoComplete={autoComplete}
                      value={profile[name]}
                      onChange={handleFieldChange}
                      disabled={!userId || saving}
                      required
                      className="h-11 rounded-lg border-[#d3d5da] bg-[#f7f7f7] px-3 text-base focus-visible:border-[#323232] focus-visible:ring-[#323232]/20"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <Button type="submit" disabled={!userId || saving} className="h-11 w-full rounded-lg bg-[#323232] px-6 text-base text-white hover:bg-[#202020] sm:w-auto">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </>
          )}
        </form>
      </main>
    </div>
  )
}
