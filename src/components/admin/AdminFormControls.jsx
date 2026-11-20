export function FormField({
    label,
    htmlFor,
    required=false,
    hint,
    error,
    children,
}){
    return(
        <div className="min-w-0">
            <label
                htmlFor={htmlFor}
                className="mb-1.5 block text-sm font-semibold text-[#323232]"
            >
                {label}
                {required && <span className="ml-1 text-red-700">*</span>}
            </label>

            {children}

            {error ?(
                <p className="mt-1 text-xs text-red-700">{error}</p>
            ) : hint ? (
                <p className="mt-1 text-xs text-[#717171]">{hint}</p>
            ) : null}
        </div>
    )
}

const controlClass = 'box-border min-h-11 w-full min-w-0 max-w-full rounded-lg border border-[#cccccc] bg-white px-3.5 py-2 text-sm text-[#242424] focus:border-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]/20 disabled:bg-[#f1f1f1]'
export function TextInput({ type='text', className='',...props}){
    return(
        <input
           type={type}
           {...props}
           className={` ${controlClass} ${className}`}
        />
    )
}

export function SelectInput({ children, className='', ...props}){
    return(
        <select
            {...props}
            className={`${controlClass} ${className}`}
        >
            {children}
        </select>
    )
}

export function TextArea({className='',rows=4,...props}){
    return(
        <textarea
            rows={rows}
            {...props}
            className={`${controlClass} resize-y ${className}`}
        />
    )
}

export function AdminFormActions({
    onCancel,
    cancelLabel = 'Cancel',
    submitLabel= 'Save changes',
    submitting = false,
    className=''
}) {
    return(
        <div className={`flex flex-col-reverse gap-3 border-t border-[#e5e5e5] pt-4 sm:flex-row sm:justify-end ${className}`}>
            {onCancel && (
                <button
                    type="button"
                    onClick={onCancel}
                    className="min-h-11 rounded-lg border border-[#bdbdbd] bg-white px-5 text-sm font-semibold text-[#323232] hover:bg-[#f4f4f4]"
                >
                    {cancelLabel}
                </button>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="min-h-11 rounded-full bg-[#323232] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#484848] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {submitting ? 'Saving…' : submitLabel}
            </button>
        </div>
    )
}