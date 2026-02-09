import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import Button from './Button';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    isLoading = false,
    showCloseButton = true
}) => {
    const getVariantConfig = () => {
        const configs = {
            danger: {
                icon: <AlertCircle className="w-6 h-6" />,
                iconBg: "bg-red-50",
                iconText: "text-red-600",
                button: "bg-red-600 hover:bg-red-700",
                borderColor: "border-red-100",
                textColor: "text-red-700",
                topBar: "bg-red-600"
            },
            warning: {
                icon: <AlertTriangle className="w-6 h-6" />,
                iconBg: "bg-amber-50",
                iconText: "text-amber-600",
                button: "bg-amber-600 hover:bg-amber-700",
                borderColor: "border-amber-100",
                textColor: "text-amber-700",
                topBar: "bg-amber-600"
            },
            success: {
                icon: <CheckCircle className="w-6 h-6" />,
                iconBg: "bg-green-50",
                iconText: "text-green-600",
                button: "bg-green-600 hover:bg-green-700",
                borderColor: "border-green-100",
                textColor: "text-green-700",
                topBar: "bg-green-600"
            },
            info: {
                icon: <Info className="w-6 h-6" />,
                iconBg: "bg-blue-50",
                iconText: "text-blue-600",
                button: "bg-blue-600 hover:bg-blue-700",
                borderColor: "border-blue-100",
                textColor: "text-blue-700",
                topBar: "bg-blue-600"
            }
        };
        return configs[variant] || configs.danger;
    };

    const variantConfig = getVariantConfig();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-white rounded-xl shadow-xl w-full max-w-md relative z-10 overflow-hidden border border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top accent bar */}
                        <div className={`h-1 w-full ${variantConfig.topBar}`} />

                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-lg ${variantConfig.iconBg} ${variantConfig.borderColor} border`}>
                                        <div className={variantConfig.iconText}>
                                            {variantConfig.icon}
                                        </div>
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                                </div>
                                {showCloseButton && (
                                    <button
                                        onClick={onClose}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        disabled={isLoading}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Message */}
                            <div className="mb-6">
                                <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="flex-1"
                                    disabled={isLoading}
                                >
                                    {cancelText}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={onConfirm}
                                    isLoading={isLoading}
                                    className={`flex-1 ${variantConfig.button} text-white`}
                                >
                                    {confirmText}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;