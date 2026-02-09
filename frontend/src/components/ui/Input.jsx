import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({ label, error, leftIcon, helperText, className, ...props }, ref) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-sm font-bold text-slate-700 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        {leftIcon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "input-field h-12",
                        leftIcon && "pl-11",
                        error && "border-red-500 focus:ring-red-500 bg-red-50/10",
                        className
                    )}
                    {...props}
                />
            </div>
            {helperText && !error && (
                <p className="text-[10px] text-gray-500 ml-1">{helperText}</p>
            )}
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
