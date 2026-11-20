import { useId } from 'react'

export default function AdminSearchInput({
    label='Search Records',
    value,
    onChange,
    placeholder='Search Records',
    helpText,
    title,
}){
    const helpId = useId()
    return(
        <label className="block w-full min-w-0">
            <span className="sr-only">{label}</span>

            <input
                type="search"
                aria-label={label}
                aria-describedby={helpText ? helpId : undefined}
                title={title}
                placeholder={placeholder}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="min-h-11 w-full rounded-lg border border-[#cccccc] bg-white px-3.5 py-2 text-sm text-[#242424] placeholder:text-[#717171] focus:border-[#323232] focus:outline-none focus:ring-2 focus:ring-[#323232]/20"/>
            {helpText && (
                <span id={helpId} className="sr-only">
                    {helpText}
                </span>
            )}
        </label>
    )
}