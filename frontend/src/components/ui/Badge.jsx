import React from 'react';
import { cn } from '../../utils/cn';

const Badge = ({ children, variant = 'default', className }) => {
    const variants = {
        default: "bg-slate-50 text-slate-600 border-slate-100",
        primary: "bg-blue-50 text-blue-600 border-blue-100",
        success: "bg-emerald-50 text-emerald-600 border-emerald-100",
        warning: "bg-amber-50 text-amber-600 border-amber-100",
        danger: "bg-red-50 text-red-600 border-red-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
    };

    return (
        <span className={cn(
            "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm inline-flex items-center gap-2",
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
};

export default Badge;
