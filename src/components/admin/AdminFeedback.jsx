export function AdminLoadingState({message = 'Loading records...'}){
    return(
        <div
            role="status"
            className="rounded-xl border border-[#dedede] bg-white px-5 py-10 text-center text-sm text-[#717171]"
        >
            {message}
        </div>
    )
}

export function AdminErrorState({children, onRetry}){
    return(
        <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
        >
            <div>{children}</div>

            {onRetry && (
                <button
                type="button"
                onClick={onRetry}
                className="mt-3 min-h-10 rounded-lg border border-red-300 px-3 font-semibold hover:bg-red-100"
                >
                    Try again
                </button>
            )}
        </div>
    )
}

export function AdminNotice({children, tone='success'}) {
    const toneStyles={
        success: 'border-green-200 bg-green-50 text-green-900',
        error: 'border-red-200 bg-red-50 text-red-900',
        info: 'border-blue-200 bg-blue-50 text-blue-900'
    }

    const role = tone === 'error' ? 'alert' : 'status'
    const styles = toneStyles[tone] || toneStyles.success

    return (
        <div role={role} className={`rounded-lg border px-4 py-3 text-sm ${styles}`}>
            {children}
        </div>
    )
}