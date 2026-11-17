const statusStyles = {
    pending: 'bg-amber-100 text-amber-900',
    confirmed: 'bg-green-100 text-green-900',
    high: 'bg-green-100 text-green-900', //maybe for inventory?
    denied: 'bg-red-100 text-red-900',
    low: 'bg-red-100 text-red-900', //maybe for inventory?
    completed: 'bg-blue-100 text-blue-900'
}

export default function AdminStatusBadge({status}){
    const label = status ? String(status).toLowerCase() : 'unknown'
    const style = statusStyles[label] || 'bg-[#ececea] text-[#323232]'

    return(
        <span className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-semibold capitalize ${style}`}>
            {label}
        </span>
    )
}