'use client';

import React, { useState } from 'react';
import { useUpdateProfileMutation } from '@/store/userApi';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/authSlice';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { FaStar, FaRocket, FaGraduationCap, FaCheck } from 'react-icons/fa';
import { HiHandRaised } from 'react-icons/hi2';

const LEVELS = [
    {
        id: 'primary',
        label: 'Primary',
        range: '(1-5)',
        icon: FaStar,
        defaultLevel: 1,
        gradient: 'from-amber-400 to-orange-500',
        description: 'Elementary education basics'
    },
    {
        id: 'secondary',
        label: 'Secondary',
        range: '(6-10)',
        icon: FaRocket,
        defaultLevel: 6,
        gradient: 'from-blue-400 to-indigo-600',
        description: 'High school & early prep'
    },
    {
        id: 'college',
        label: 'College',
        range: '(11+)',
        icon: FaGraduationCap,
        defaultLevel: 11,
        gradient: 'from-purple-500 to-pink-600',
        description: 'University & advanced studies'
    }
];

export default function LearningLevelModal({ isOpen, user }) {
    const [selected, setSelected] = useState(null);
    const [updateProfile, { isLoading }] = useUpdateProfileMutation();
    const dispatch = useDispatch();

    if (!isOpen) return null;

    const handleLevelSelect = async () => {
        if (!selected) return;

        try {
            const response = await updateProfile({
                learnLevel: selected.id,
                level: selected.defaultLevel
            }).unwrap();

            if (response.success) {
                // Update local state
                dispatch(setUser(response.data));
            }
        } catch (error) {
            console.error('Failed to update learning level:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-4xl bg-background rounded-3xl border border-[var(--card-border)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 md:p-12 space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl md:text-4xl font-display font-bold flex items-center justify-center gap-2">
                            Welcome to <span className="gradient-text">MathTutor AI</span>! <HiHandRaised className="text-3xl" />
                        </h2>
                        <p className="text-foreground-secondary text-lg max-w-2xl mx-auto">
                            To personalize your learning experience, please select your current educational level. This will help us provide the right level of difficulty.
                        </p>
                    </div>

                    {/* Level Options */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {LEVELS.map((level) => (
                            <button
                                key={level.id}
                                onClick={() => setSelected(level)}
                                className={`relative group p-1 rounded-2xl transition-all duration-300 text-left ${selected?.id === level.id
                                    ? 'ring-2 ring-primary-500'
                                    : 'hover:translate-y-[-4px]'
                                    }`}
                            >
                                <Card className={`h-full border-none transition-all duration-300 ${selected?.id === level.id
                                    ? 'bg-primary-50/50 dark:bg-primary-900/20'
                                    : 'hover:shadow-xl'
                                    }`}>
                                    <div className="space-y-6">
                                        {/* Icon */}
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${level.gradient} flex items-center justify-center text-3xl text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-300`}>
                                            <level.icon className="text-3xl" />
                                        </div>

                                        {/* Content */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-bold">{level.label}</h3>
                                                <span className="text-sm font-medium text-foreground-secondary">{level.range}</span>
                                            </div>
                                            <p className="text-sm text-foreground-secondary leading-relaxed">
                                                {level.description}
                                            </p>
                                        </div>

                                        {/* Select Indicator */}
                                        <div className={`flex items-center gap-2 text-sm font-bold transition-all duration-300 ${selected?.id === level.id ? 'text-primary-500' : 'text-foreground-secondary'
                                            }`}>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${selected?.id === level.id ? 'border-primary-500 bg-primary-500 text-white' : 'border-neutral-300 dark:border-neutral-700'
                                                }`}>
                                                {selected?.id === level.id && <FaCheck className="text-[10px]" />}
                                            </div>
                                            {selected?.id === level.id ? 'Selected' : 'Select Level'}
                                        </div>
                                    </div>
                                </Card>
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex flex-col items-center gap-4">
                        <Button
                            size="lg"
                            className="w-full md:w-64 h-14 text-lg rounded-2xl shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2"
                            disabled={!selected || isLoading}
                            onClick={handleLevelSelect}
                        >
                            {isLoading ? 'Setting things up...' : (
                                <>
                                    Start Learning! <FaRocket />
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-foreground-secondary flex items-center gap-2">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            You can always change your level later in settings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
