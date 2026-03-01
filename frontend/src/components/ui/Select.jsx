import React from 'react';
import { cn } from '../../utils/cn';

const Select = React.forwardRef(({ label, error, helperText, options = [], leftIcon, className, ...props }, ref) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-sm font-bold text-slate-700 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                        {leftIcon}
                    </div>
                )}
                <select
                    ref={ref}
                    className={cn(
                        "input-field h-12 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-no-repeat bg-[right_0.75rem_center]",
                        leftIcon && "pl-11",
                        error && "border-red-500 focus:ring-red-500 bg-red-50/10",
                        className
                    )}
                    {...props}
                >
                    {props.placeholder && <option value="">{props.placeholder}</option>}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label} {option.description ? `(${option.description})` : ''}
                        </option>
                    ))}
                </select>
            </div>
            {helperText && !error && (
                <p className="text-[10px] text-slate-500 ml-1 leading-relaxed">
                    {helperText}
                </p>
            )}
            {error && (
                <p className="text-xs font-bold text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    );
});

Select.displayName = 'Select';

export default Select;
