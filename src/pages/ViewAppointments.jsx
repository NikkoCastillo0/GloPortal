import { useCallback, useState } from 'react'
import Header from '../components/home/Header.jsx'
import AppointmentFilters from '../components/viewAppointments/AppointmentFilters.jsx'
import AppointmentPagination from '../components/viewAppointments/AppointmentPagination.jsx'
import AppointmentTable from '../components/viewAppointments/AppointmentTable.jsx'

const PAGE_SIZE = 6

export default function ViewAppointments() {
    const [filter, setFilter] = useState('date')
    const [date, setDate] = useState('')
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

    return (
        <>
            <Header
                role="admin"
                isHome={false}
                isSignedIn={true}
            />

            <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-8">
                <h1 className="text-3xl font-semibold">All Appointments</h1>

                <AppointmentFilters
                    value={filter}
                    onChange={handleFilterChange}
                    date={date}
                    onDateChange={(nextDate) => {
                        setDate(nextDate)
                        setPage(1)
                    }}
                />

                <AppointmentTable
                    filter={filter}
                    date={date}
                    page={page}
                    pageSize={PAGE_SIZE}
                    onTotalCountChange={updateTotalCount}
                    onLoadingChange={setIsLoading}
                />

                <AppointmentPagination
                    page={page}
                    pageSize={PAGE_SIZE}
                    totalCount={totalCount}
                    isLoading={isLoading}
                    onPageChange={setPage}
                />
            </main>
        </>
    )
}
