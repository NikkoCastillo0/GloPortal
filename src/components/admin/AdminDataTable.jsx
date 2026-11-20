export default function AdminDataTable({
    rows=[],
    columns = [],
    getRowKey = (row) => row.id,
    actions,
    emptyMessage = 'No records found.'
}){
    if(!rows.length){
        return(
            <div className="rounded-xl border border-[#dedede] bg-white px-5 py-12 text-center text-sm text-[#717171]">
                {emptyMessage}
            </div>
        )
    }

    return(
        <>
            <div className="hidden overflow-hidden rounded-xl border border-[#dedede] bg-white shadow-sm md:block">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px] border-separate border-spacing-0 text-left text-sm">
                        <thead className="bg-[#ececea] text-xs font-semibold uppercase tracking-wide text-[#323232]">
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        scope="col"
                                        className="border-b border-r border-[#d3d3d3] px-4 py-3"
                                    >
                                        {column.header}
                                    </th>
                                ))}

                                {actions && (
                                    <th
                                        scope="col"
                                        className="sticky right-0 z-20 w-24 border-b border-l border-[#d3d3d3] bg-[#ececea] px-4 py-3 text-center"
                                    >
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((row, index) => (
                                <tr
                                    key={getRowKey(row)}
                                    className={index % 2 === 0 ? 'bg-[#fafaf9]' : 'bg-white'}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className="border-b border-r border-[#e5e5e5] px-4 py-3.5 align-middle text-[#323232]"
                                        >
                                            {column.render ? column.render(row) : row[column.key]}
                                        </td>
                                    ))}

                                    {actions && (
                                        <td
                                            className={`sticky right-0 z-[1] border-b border-l border-[#dedede] px-3 py-2 text-center ${
                                                index %2 === 0 ? 'bg-[#fafaf9]' : 'bg-white'
                                            }`}
                                        >
                                            {actions(row)}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>



            <div className="grid gap-3 md:hidden">
                {rows.map((row) => (
                    <article
                        key={getRowKey(row)}
                        className="rounded-xl border border-[#dedede] bg-white p-4 shadow-sm"
                    >
                        <dl className="grid gap-3">
                            {columns.map((column) => (
                                <div
                                    key={column.key}
                                    className="grid grid-cols-[minmax(6rem,0.7fr)_minmax(0,1.3fr)] gap-3 border-b border-[#eeeeee] pb-2 last:border-0 last:pb-0"
                                >
                                    <dt className="text-xs font-semibold text-[#717171]">
                                        {column.header}
                                    </dt>

                                    <dd className="min-w-0 break-words text-sm text-[#323232]">
                                        {column.render ? column.render(row) : row[column.key]}
                                    </dd>
                                </div>
                            ))}
                        </dl>

                        {actions && (
                            <div className="mt-4 border-t border-[#eeeeee] pt-3">
                                {actions(row)}
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </>
    )
}