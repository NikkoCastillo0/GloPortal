
import { useCallback, useEffect, useState } from 'react'
import Header from '../components/layout/Header.jsx'
import AppointmentFilters from '../components/viewAppointments/AppointmentFilters.jsx'
import AppointmentTable from '../components/viewAppointments/AppointmentTable.jsx'
import { supabase } from '../lib/supabase.js'
import { AdminPageLayout, AdminPageHeader } from '../components/admin/AdminPageLayout.jsx'
import AdminDataToolbar from '../components/admin/AdminDataToolbar.jsx'
import AdminPagination from '../components/admin/AdminPagination.jsx'

const PAGE_SIZE = 6

export default function ViewAppointments() {
  const [accessStatus, setAccessStatus] = useState('loading')
  const [filter, setFilter] = useState('date')
  const [date, setDate] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const updateTotalCount = useCallback((count) => {
    setTotalCount(count)
  }, [])

  const handleFilterChange = (nextFilter) => {
    setFilter(nextFilter)
    setPage(1)
  }

  useEffect(() => {
    let active = true
    let verificationId = 0

    async function verifyAdmin() {
      const currentVerification = ++verificationId

      if (active) {
        setAccessStatus('loading')
      }

      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser()

        if (!active || currentVerification !== verificationId) return

        if (userError || !userData.user) {
          setAccessStatus('denied')
          return
        }

        const { data: profile, error: profileError } =
          await supabase
            .from('profiles')
            .select('role')
            .eq('id', userData.user.id)
            .single()

        if (!active || currentVerification !== verificationId) return

        if (profileError || profile?.role !== 'admin') {
          setAccessStatus('denied')
          return
        }

        setAccessStatus('authorized')
      } catch (error) {
        console.error('Admin verification failed:', error)

        if (active && currentVerification === verificationId) {
          setAccessStatus('denied')
        }
      }
    }

    verifyAdmin()

    const { data: authListener } =
      supabase.auth.onAuthStateChange(() => {
        queueMicrotask(() => {
          if (active) {
            verifyAdmin()
          }
        })
      })

    return () => {
      active = false
      verificationId++
      authListener.subscription.unsubscribe()
    }
  }, [])

  if (accessStatus === 'loading') {
    return (
      <main>
        <p>Verifying administrator access...</p>
      </main>
    )
  }

  if (accessStatus !== 'authorized') {
    return (
      <main>
        <h1>Access Denied</h1>
        <p>
          You must be signed in as an administrator
          to view all appointment records.
        </p>
      </main>
    )
  }

  return (
    <>
      <AdminPageLayout
        header={<Header role="admin" isHome={false} />}
      >
        <AdminPageHeader
          title="All Appointments"
          action={
            <a
              href="/createappointment"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#323232] px-6 py-3 font-semibold text-white"
            >
              Create appointments
            </a>
          }
        >
          <AdminPagination
            page={page}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
            isLoading={isLoading}
            onPageChange={setPage}
            itemLabel="appointments"
            ariaLabel="Appointment table pagination"
          />
        </AdminPageHeader>
          
        <AdminDataToolbar
          className="mb-4"
          filters={
            <AppointmentFilters
              value={filter}
              onChange={handleFilterChange}
              date={date}
              search={search}
              onSearchChange={(value) => {
                setSearch(value)
                setPage(1)
              }}
              onDateChange={(nextDate) => {
                setDate(nextDate)
                setPage(1)
              }}
            />
          }
        />

        {(filter === 'most-jobs' || filter === 'least-jobs') && (
          <p className="mb-5 -mt-2 text-sm text-[#717171]">Ordered by each customer's total completed appointments, across all dates.</p>
        )}

        <AppointmentTable
          filter={filter}
          search={search}
          date={date}
          page={page}
          pageSize={PAGE_SIZE}
          onTotalCountChange={updateTotalCount}
          onLoadingChange={setIsLoading}
        />
      </AdminPageLayout>
    </>
  )
}
