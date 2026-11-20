import { useEffect, useRef, useState } from 'react'
import { createAdminDashboardController } from '../lib/adminDashboard.js'
import { supabase } from '../lib/supabase.js'

export default function useAdminDashboard() {
  const [state, setState] = useState({ status: 'loading', summary: null })
  const controllerRef = useRef(null)

  useEffect(() => {
    const controller = createAdminDashboardController(supabase, setState)
    controllerRef.current = controller
    controller.refresh()
    return () => {
      controllerRef.current = null
      controller.dispose()
    }
  }, [])

  function handleRefresh() {
    controllerRef.current?.refresh()
  }

  return { ...state, handleRefresh }
}
