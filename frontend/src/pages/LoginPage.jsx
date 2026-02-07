import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { cn } from '../utils/cn';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, error: authError, loading } = useAuthStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        const success = await login(data.email, data.password);
        if (success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 p-4">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-300/20 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card w-full max-w-md p-8 rounded-2xl relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg mb-4">
                        <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
                    <p className="text-slate-500 mt-2">Sign in to manage your institution</p>
                </div>

                {authError && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{authError}</p>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                            </div>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="admin@school.com"
                                className={cn(
                                    "input-field pl-10",
                                    errors.email && "border-red-300 focus:ring-red-500"
                                )}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-red-500 font-medium ml-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                            </div>
                            <input
                                {...register('password')}
                                type="password"
                                placeholder="••••••••"
                                className={cn(
                                    "input-field pl-10",
                                    errors.password && "border-red-300 focus:ring-red-500"
                                )}
                            />
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-500 font-medium ml-1">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between py-1">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                            />
                            <label htmlFor="remember-me" className="ml-2 text-sm text-slate-600 cursor-pointer">
                                Remember me
                            </label>
                        </div>
                        <button type="button" className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                            Forgot password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full h-11 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500">
                        Don't have access? <span className="font-semibold text-primary-600 cursor-help">Contact your administrator</span>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
