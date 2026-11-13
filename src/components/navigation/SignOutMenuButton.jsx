import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'

export default function SignOutMenuButton({ clearCacheOnSignOut = false }) {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState(null)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    setIsSigningOut(true)
    setSignOutError(null)

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      if (clearCacheOnSignOut) {
        window.localStorage.clear()
        window.sessionStorage.clear()
      }

      navigate('/', { replace: true })
    } catch (error) {
      console.error('Failed to sign out:', error)
      setSignOutError(
        error instanceof Error ? error.message : 'Unable to sign out. Please try again.',
      )
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        aria-busy={isSigningOut}
        className="w-full rounded-lg bg-black px-4 py-3 text-center text-lg font-semibold text-white transition hover:bg-gray-700 disabled:opacity-70"
      >
        {isSigningOut ? 'Signing out...' : 'Sign out'}
      </button>
      {signOutError && <p role="alert">{signOutError}</p>}
    </div>
  )
}
