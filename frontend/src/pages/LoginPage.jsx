import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';
import upfLogo from '../assets/upf-logo.png';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, error: authError, loading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const emailValue = watch('email');
    const passwordValue = watch('password');

    const onSubmit = async (data) => {
        const success = await login(data.email, data.password);
        if (success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-200 rounded-full opacity-20 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full opacity-40 blur-3xl" />
            </div>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-xl shadow-lg w-full max-w-md relative z-10 overflow-hidden border border-gray-100"
            >
                {/* Header Section */}
                <div className="p-8 pb-6">
                    <div className="flex flex-col items-center justify-center gap-4 mb-6">
                        <img src={upfLogo} alt="UPF Logo" className="h-20 w-auto object-contain drop-shadow-sm" />
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">University Portal</h1>
                            <p className="text-sm text-gray-500">Secure Administration System</p>
                        </div>
                    </div>

                    {/* <div className="text-center mb-2">
                        <h2 className="text-lg font-semibold text-gray-900">Sign in to your account</h2>
                        <p className="text-sm text-gray-500 mt-1">Enter your credentials to continue</p>
                    </div> */}
                </div>

                {/* Error Message */}
                {authError && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-8 mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3"
                    >
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700">{authError}</p>
                    </motion.div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-4">
                    {/* Email Field */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="you@university.edu"
                                className={cn(
                                    "w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all",
                                    "placeholder:text-gray-400",
                                    errors.email
                                        ? "border-red-300 bg-red-50 focus:ring-red-500 focus:ring-opacity-20"
                                        : "border-gray-300 bg-white focus:ring-gray-900 focus:ring-opacity-20"
                                )}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.email.message}
                            </p>
                        )}
                        {emailValue && !errors.email && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                                ✓ Valid email format
                            </p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                <Lock className="w-3.5 h-3.5" />
                                Password
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-xs text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                className={cn(
                                    "w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all",
                                    "placeholder:text-gray-400",
                                    errors.password
                                        ? "border-red-300 bg-red-50 focus:ring-red-500 focus:ring-opacity-20"
                                        : "border-gray-300 bg-white focus:ring-gray-900 focus:ring-opacity-20",
                                    passwordValue && "pr-10"
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.password.message}
                            </p>
                        )}
                        {passwordValue && !errors.password && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                                ✓ Password meets requirements
                            </p>
                        )}
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between py-1">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 focus:ring-offset-0"
                            />
                            <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600 cursor-pointer select-none">
                                Remember this device
                            </label>
                        </div>
                        <button
                            type="button"
                            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Forgot password?
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "w-full py-3 text-sm font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
                            loading
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900"
                        )}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Signing in...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <LogIn className="w-4 h-4" />
                                Sign In
                            </span>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="border-t border-gray-100 p-6 bg-gray-50">
                    <div className="text-center space-y-3">
                        <p className="text-sm text-gray-600">
                            Want to test the platform?{' '}
                            <a 
                                href="https://zoubaa.dev/projects/a7c795f2-d1b8-488f-8f86-e6b9a5704a13" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Click here to get a demo account
                            </a>
                        </p>
                        <p className="text-sm text-gray-600">
                            Need help accessing your account?{' '}
                            <button type="button" className="font-medium text-gray-900 hover:text-gray-700 transition-colors">
                                Contact IT Support
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Version Info */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
                <p className="text-xs text-gray-400">University Portal v2.1 • Secure Authentication</p>
            </div>
        </div>
    );
};

export default LoginPage;