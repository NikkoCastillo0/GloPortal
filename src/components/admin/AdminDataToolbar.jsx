export default function AdminDataToolbar({
    filters,
    pagination,
    className='',
}){
    return(
        <div className={`grid min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_auto] ${className}`}>
            <div className="min-w-0">{filters}</div>

            {pagination && (
                <div className="min-w-0 lg:justify-self-end">
                    {pagination}
                </div>
            )}
        </div>
    )
}