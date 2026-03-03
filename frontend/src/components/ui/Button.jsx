import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const Button = ({ children, variant = 'primary', className, isLoading, icon: Icon, iconPosition = 'left', disabled, ...props }) => {
    const variants = {
        primary: "btn-primary shadow-2xl shadow-primary-600/30 text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98]",
        secondary: "border border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-50 transition-all hover:scale-[1.02] active:scale-[0.98]",
        danger: "bg-red-50 text-red-600 border border-red-100 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-red-100/50 hover:shadow-lg hover:shadow-red-500/20",
        ghost: "p-2.5 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-primary-600 transition-all border border-transparent hover:border-slate-100"
    };

    return (
        <button
            className={cn(
                "flex items-center justify-center gap-3 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                className
            )}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && <Loader2 className="animate-spin" size={16} />}
            {!isLoading && Icon && iconPosition === 'left' && <Icon size={20} />}
            {children}
            {!isLoading && Icon && iconPosition === 'right' && <Icon size={20} />}
        </button>
    );
};

export default Button;
