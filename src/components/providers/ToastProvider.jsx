'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaLightbulb } from 'react-icons/fa';

const ToastContext = createContext(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

let toastId = 0;

export default function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 5000) => {
        const id = ++toastId;
        const toast = { id, message, type, duration };

        setToasts(prev => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
    const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
    const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
    const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-4 pointer-events-none">
            {toasts.map((toast, index) => (
                <Toast
                    key={toast.id}
                    toast={toast}
                    onClose={() => removeToast(toast.id)}
                    index={index}
                />
            ))}
        </div>
    );
}

function Toast({ toast, onClose, index }) {
    const { message, type } = toast;
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        // Check theme on mount and when it changes
        const checkTheme = () => {
            const theme = document.documentElement.getAttribute('data-theme');
            setIsDark(theme === 'dark');
        };

        checkTheme();

        // Watch for theme changes
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        return () => observer.disconnect();
    }, []);

    const icons = {
        success: FaCheckCircle,
        error: FaTimesCircle,
        warning: FaExclamationTriangle,
        info: FaLightbulb,
    };

    // Dark theme config
    const darkConfig = {
        success: {
            bg: 'bg-neutral-900/95',
            iconBg: 'bg-emerald-500/20',
            iconColor: 'text-emerald-400',
            borderColor: 'border-emerald-500/30',
            textColor: 'text-white',
            subtextColor: 'text-neutral-400',
            accentBar: 'bg-gradient-to-b from-emerald-400 to-green-500',
            closeHover: 'hover:bg-neutral-700/50',
        },
        error: {
            bg: 'bg-neutral-900/95',
            iconBg: 'bg-red-500/20',
            iconColor: 'text-red-400',
            borderColor: 'border-red-500/30',
            textColor: 'text-white',
            subtextColor: 'text-neutral-400',
            accentBar: 'bg-gradient-to-b from-red-400 to-rose-500',
            closeHover: 'hover:bg-neutral-700/50',
        },
        warning: {
            bg: 'bg-neutral-900/95',
            iconBg: 'bg-amber-500/20',
            iconColor: 'text-amber-400',
            borderColor: 'border-amber-500/30',
            textColor: 'text-white',
            subtextColor: 'text-neutral-400',
            accentBar: 'bg-gradient-to-b from-amber-400 to-orange-500',
            closeHover: 'hover:bg-neutral-700/50',
        },
        info: {
            bg: 'bg-neutral-900/95',
            iconBg: 'bg-purple-500/20',
            iconColor: 'text-purple-400',
            borderColor: 'border-purple-500/30',
            textColor: 'text-white',
            subtextColor: 'text-neutral-400',
            accentBar: 'bg-gradient-to-b from-purple-400 to-purple-600',
            closeHover: 'hover:bg-neutral-700/50',
        },
    };

    // Light theme config
    const lightConfig = {
        success: {
            bg: 'bg-white/95',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            borderColor: 'border-emerald-200',
            textColor: 'text-neutral-900',
            subtextColor: 'text-neutral-600',
            accentBar: 'bg-gradient-to-b from-emerald-400 to-green-500',
            closeHover: 'hover:bg-neutral-100',
        },
        error: {
            bg: 'bg-white/95',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            borderColor: 'border-red-200',
            textColor: 'text-neutral-900',
            subtextColor: 'text-neutral-600',
            accentBar: 'bg-gradient-to-b from-red-400 to-rose-500',
            closeHover: 'hover:bg-neutral-100',
        },
        warning: {
            bg: 'bg-white/95',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            borderColor: 'border-amber-200',
            textColor: 'text-neutral-900',
            subtextColor: 'text-neutral-600',
            accentBar: 'bg-gradient-to-b from-amber-400 to-orange-500',
            closeHover: 'hover:bg-neutral-100',
        },
        info: {
            bg: 'bg-white/95',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            borderColor: 'border-purple-200',
            textColor: 'text-neutral-900',
            subtextColor: 'text-neutral-600',
            accentBar: 'bg-gradient-to-b from-purple-400 to-purple-600',
            closeHover: 'hover:bg-neutral-100',
        },
    };

    const config = isDark ? darkConfig : lightConfig;
    const style = config[type] || config.info;
    const IconComponent = icons[type] || icons.info;

    return (
        <div
            className={`
                pointer-events-auto
                relative
                flex items-start gap-4
                px-5 py-4
                min-w-[360px] max-w-[440px]
                rounded-2xl
                ${style.bg}
                backdrop-blur-xl
                border ${style.borderColor}
                shadow-2xl
                animate-toast-slide-in
                transition-all duration-300
                hover:scale-[1.01]
                overflow-hidden
            `}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {/* Accent bar on left */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.accentBar}`} />

            {/* Icon */}
            <div className={`
                flex-shrink-0
                w-10 h-10
                rounded-xl
                ${style.iconBg}
                flex items-center justify-center
                ${style.iconColor}
                text-lg font-bold
            `}>
                <IconComponent className="text-lg" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
                <p className={`text-sm font-medium ${style.textColor} leading-relaxed`}>
                    {message}
                </p>
            </div>

            {/* Close Button */}
            <button
                onClick={onClose}
                className={`
                    flex-shrink-0
                    w-7 h-7
                    rounded-lg
                    ${style.closeHover}
                    flex items-center justify-center
                    transition-all duration-200
                    hover:rotate-90
                    ${style.subtextColor}
                `}
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Progress bar */}
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-white/5' : 'bg-black/5'} overflow-hidden`}>
                <div
                    className={`h-full ${style.accentBar} animate-toast-progress`}
                    style={{ animationDuration: `${toast.duration}ms` }}
                />
            </div>
        </div>
    );
}
