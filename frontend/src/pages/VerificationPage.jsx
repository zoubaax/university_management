import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    ShieldCheck,
    ShieldAlert,
    Calendar,
    User,
    Award,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Hash
} from 'lucide-react';

const VerificationPage = () => {
    const { code } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verifyDocument = async () => {
            try {
                setLoading(true);
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
                const response = await axios.get(`${apiUrl}/verify/${code}`);
                setData(response.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Verification failed. This document code might be invalid or revoked.');
            } finally {
                setLoading(false);
            }
        };

        if (code) verifyDocument();
    }, [code]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Verifying Academic Document...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full"
            >
                {/* UPF Logo Placeholder */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-indigo-700">
                        UPF SMART CAMPUS
                    </h1>
                    <p className="text-gray-500 font-medium tracking-widest text-xs uppercase mt-2">
                        Official Verification Portal
                    </p>
                </div>

                {error ? (
                    <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center">
                        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldAlert size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                        <p className="text-gray-600 mb-8">{error}</p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                        >
                            <ArrowLeft size={18} />
                            Back to Home
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
                        {/* Success Header */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center text-white">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                <ShieldCheck size={36} />
                            </div>
                            <h2 className="text-2xl font-bold">Document Match Found</h2>
                            <p className="opacity-90 font-medium">This document is authentic and valid.</p>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Verification ID Tag */}
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <Hash size={14} /> Verification Code
                                </span>
                                <span className="font-mono text-indigo-600 font-bold uppercase">{code?.substring(0, 16)}</span>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <DetailItem
                                    icon={User}
                                    label="Student Name"
                                    value={data.student}
                                />
                                <DetailItem
                                    icon={Award}
                                    label="Academic Program"
                                    value={data.speciality}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem
                                        icon={Hash}
                                        label="Registration #"
                                        value={data.registration}
                                    />
                                    <DetailItem
                                        icon={Calendar}
                                        label="Academic Year"
                                        value={data.academic_year}
                                    />
                                </div>
                                <DetailItem
                                    icon={Clock}
                                    label="Issue Date"
                                    value={new Date(data.issued_at).toLocaleDateString('en-US', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                />
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-3 text-sm text-green-700 font-medium bg-green-50 p-4 rounded-xl border border-green-100">
                                    <CheckCircle2 size={24} className="text-green-600 flex-shrink-0" />
                                    This confirms that the digital record matches the presented document.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Info */}
                <p className="text-center text-gray-400 text-xs mt-8 uppercase tracking-widest font-bold">
                    Smart UPF Blockchain-Grade verification system
                </p>
            </motion.div>
        </div>
    );
};

const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="p-2.5 bg-gray-50 text-gray-400 rounded-lg border border-gray-100">
            <Icon size={18} />
        </div>
        <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-gray-900 font-bold">{value}</p>
        </div>
    </div>
);

export default VerificationPage;
