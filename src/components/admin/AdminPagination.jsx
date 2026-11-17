import {ChevronLeft, ChevronRight} from 'lucide-react'

export default function AdminPagination({
    page,
    pageSize,
    totalCount,
    isLoading=false,
    onPageChange,
    itemLabel = 'records',
    ariaLabel = 'Table pagination',
    className = '',
}){
    const totalPages = Math.max(1,Math.ceil(totalCount/pageSize))
    const displayedCount = Math.min(page * pageSize, totalCount)

    return(
        <nav
            aria-label={ariaLabel}
            className={`flex min-h-11 items-center justify-start gap-2 whitespace-nowrap ${className}`}
        >
            <button
                type="button"
                className="grid min-h-11 min-w-11 place-items-center rounded-md text-[#323232] hover:bg-[#ececea] disabled:cursor-default disabled:opacity-40"
                aria-label={`previous ${itemLabel} page`}
                disabled={isLoading || page<=1}
                onClick={() => onPageChange(page-1)}
            >
                <ChevronLeft aria-hidden="true" />
            </button>

            <span aria-live="polite" className="text-sm font-semibold text-[#323232]">
                {displayedCount} of {totalCount}
            </span>

            <button
                type="button"
                className="grid min-h-11 min-w-11 place-items-center rounded-md text-[#323232] hover:bg-[#ececea] disabled:cursor-default disabled:opacity-40"
                aria-label={`Next ${itemLabel} page`}
                disabled={isLoading || page >= totalPages}
                onClick={() => onPageChange(page+1)}
            >
                <ChevronRight aria-hidden="true"/>
            </button>
        </nav>
    )
}