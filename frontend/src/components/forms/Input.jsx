import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({ label, error, className, ...props }, ref) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-sm font-bold text-slate-700 ml-1">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={cn(
                    "input-field h-12",
                    error && "border-red-500 focus:ring-red-500 bg-red-50/10",
                    className
                )}
                {...props}
            />
            {error && (
                <p className="text-xs font-bold text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
