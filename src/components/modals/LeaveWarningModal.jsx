'use client';

import { useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FaExclamationTriangle, FaSpinner, FaPlay } from 'react-icons/fa';

export default function LeaveWarningModal({
    isOpen,
    onStay,
    onLeave,
    isSaving = false,
    message = "Leave This Page?",
    description = "Your progress will be saved automatically. You can resume from where you left off.",
    stayButtonText = "Resume",
    leaveButtonText = "OK"
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center w-screen h-screen p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <Card variant="glass" className="max-w-md w-full p-6 lg:p-8 animate-scale-in">
                <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-warning/20 to-warning/10 flex items-center justify-center border-2 border-warning/30">
                        <FaExclamationTriangle className="text-3xl text-warning" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{message}</h2>
                    <p className="text-foreground-secondary">
                        {isSaving
                            ? 'Saving your progress...'
                            : description}
                    </p>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-6 p-4 rounded-xl bg-background-secondary">
                    <div className="flex items-start gap-3 text-sm">
                        <FaPlay className="text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground-secondary">Your progress is automatically saved</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                        <FaPlay className="text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground-secondary">You can resume anytime from the topic page</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={onStay}
                        className="flex-1"
                        disabled={isSaving}
                    >
                        {stayButtonText}
                    </Button>
                    <Button
                        onClick={onLeave}
                        className="flex-1"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <FaSpinner className="animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            leaveButtonText
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
}

/**
 * Hook to handle page leave warning
 */
export function useLeaveWarning(shouldWarn = true, onBeforeLeave = null) {
    useEffect(() => {
        if (!shouldWarn) return;

        const handleBeforeUnload = (e) => {
            // Modern browsers ignore custom messages, but we can still show a warning
            e.preventDefault();
            e.returnValue = ''; // Required for Chrome
            return ''; // Required for some browsers
        };

        const handleVisibilityChange = () => {
            if (document.hidden && onBeforeLeave) {
                // Page is being hidden (tab switch, minimize, etc.)
                onBeforeLeave();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [shouldWarn, onBeforeLeave]);
}

