import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const Table = ({ data, columns, isLoading, onRowClick }) => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isLoading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id} className="bg-slate-50/50 border-b border-slate-100">
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {table.getRowModel().rows.map(row => (
                        <tr
                            key={row.id}
                            onClick={() => onRowClick && onRowClick(row.original)}
                            className={cn(
                                "hover:bg-slate-50/80 transition-all group",
                                onRowClick && "cursor-pointer"
                            )}
                        >
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="px-8 py-5">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
