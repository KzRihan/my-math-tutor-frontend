'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Progress from '@/components/ui/Progress';
import { recentActivity } from '@/data/users';
import { getInitials, formatRelativeTime, formatDuration } from '@/lib/utils';
import { useGetMeQuery, useUpdateProfileMutation } from '@/store/userApi';
import { useGetMyAchievementsQuery } from '@/store/achievementApi';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '@/store/authSlice';
import { useToast } from '@/components/providers/ToastProvider';

const LEVELS = [
    { id: 'primary', label: 'Primary', grades: '1-5', icon: '⭐' },
    { id: 'secondary', label: 'Secondary', grades: '6-10', icon: '🚀' },
    { id: 'college', label: 'College', grades: '11+', icon: '🎓' },
];

const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8001';

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const dispatch = useDispatch();
    const toast = useToast();

    // Fetch user data from API
    const { data: userData, isLoading } = useGetMeQuery();
    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
    
    // Fetch achievements from API
    const { data: achievementsData, isLoading: isLoadingAchievements } = useGetMyAchievementsQuery();
    const achievements = achievementsData?.data || [];

    // Get user from API or fallback to Redux state
    const reduxUser = useSelector((state) => state.auth.user);
    const user = userData?.data || reduxUser;

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
    });

    // Initialize form when user is available
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
            });
        }
    }, [user]);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                toast.error('Please select a valid image file (jpg, png, gif, webp)');
                return;
            }
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('firstName', formData.firstName);
            formDataToSend.append('lastName', formData.lastName);

            if (selectedFile) {
                formDataToSend.append('profileImage', selectedFile);
            }

            const response = await updateProfile(formDataToSend).unwrap();
            if (response.success) {
                dispatch(setUser(response.data));
                setIsEditing(false);
                setSelectedFile(null);
                setImagePreview(null);
                toast.success('Profile updated successfully! 🎉');
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to update profile. Please try again.');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setSelectedFile(null);
        setImagePreview(null);
    };

    const currentLevel = LEVELS.find((l) => l.id === user?.learnLevel);

    // Get profile image URL
    const getProfileImageUrl = () => {
        if (imagePreview) return imagePreview;
        if (user?.profileImage) {
            // If it's a full URL, use it directly, otherwise prepend API base URL
            if (user.profileImage.startsWith('http')) return user.profileImage;
            return `${SERVER_BASE_URL}${user.profileImage}`;
        }
        return null;
    };

    const profileImageUrl = getProfileImageUrl();

    if (isLoading) {
        return (
            <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-foreground-secondary">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-display font-bold mb-2">
                        My Profile 👤
                    </h1>
                    <p className="text-foreground-secondary">
                        View and manage your profile information
                    </p>
                </div>
                <Link href="/settings">
                    <Button variant="secondary">⚙️ Settings</Button>
                </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Main Profile */}
                    <Card className="text-center">
                        <CardContent className="py-8">
                            {/* Avatar with upload functionality */}
                            <div className="relative inline-block mb-4">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={handleImageClick}
                                    className="relative w-24 h-24 rounded-full overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                    title="Click to change profile picture"
                                >
                                    {profileImageUrl ? (
                                        <Image
                                            src={profileImageUrl}
                                            alt="Profile"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-3xl">
                                            {getInitials(user?.firstName, user?.lastName)}
                                        </div>
                                    )}
                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-2xl">📷</span>
                </div>
                                </button>
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 border-4 border-background flex items-center justify-center">
                                    <span className="text-xs">✓</span>
                                </div>
                            </div>

                            {/* Name & Email */}
                            <h2 className="text-xl font-bold">
                                {user?.firstName} {user?.lastName}
                            </h2>
                            <p className="text-foreground-secondary text-sm mb-4">{user?.email}</p>

                            {/* Grade Band */}
                            {currentLevel && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30">
                                    <span className="text-lg">{currentLevel.icon}</span>
                                    <span className="font-medium text-primary-700 dark:text-primary-300">
                                        {currentLevel.label} Level
                                    </span>
                                </div>
                            )}

                            {/* Member Since */}
                            <p className="text-xs text-foreground-secondary mt-4">
                                Member since{' '}
                                {user?.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                        month: 'long',
                                        year: 'numeric',
                                    })
                                    : 'N/A'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Level Card */}
                    <Card className="gradient-bg text-white">
                        <CardContent className="py-6 text-center">
                            <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center text-3xl mb-3">
                                🏆
                            </div>
                            <h3 className="text-2xl font-bold mb-1">Level {user?.level || 1}</h3>
                            <p className="text-white/80 text-sm mb-1">
                                <span className="text-2xl font-bold">{user?.xpPoints?.toLocaleString() || 0}</span> XP Total
                            </p>
                            <p className="text-white/60 text-xs mb-4">Total XP Points Earned</p>
                            <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden mb-2">
                                {(() => {
                                    const level = user?.level || 1;
                                    const xpPoints = user?.xpPoints || 0;
                                    const xpPerLevel = 500;
                                    const xpForCurrentLevel = (level - 1) * xpPerLevel;
                                    const xpForNextLevel = level * xpPerLevel;
                                    const progress = xpForNextLevel > xpForCurrentLevel 
                                        ? ((xpPoints - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100
                                        : 0;
                                    return (
                                        <div
                                            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all"
                                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                                        />
                                    );
                                })()}
                            </div>
                            <p className="text-white/60 text-xs">
                                {(() => {
                                    const level = user?.level || 1;
                                    const xpPoints = user?.xpPoints || 0;
                                    const xpPerLevel = 500;
                                    const xpForNextLevel = level * xpPerLevel;
                                    const xpToNextLevel = Math.max(0, xpForNextLevel - xpPoints);
                                    return xpToNextLevel > 0 
                                        ? `${xpToNextLevel} XP to Level ${level + 1}`
                                        : 'Max level reached!';
                                })()}
                            </p>
                        </CardContent>
                    </Card>

                                    </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="text-center border-2 border-primary-500/20 bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/10">
                            <CardContent className="py-4">
                                <div className="text-2xl font-bold gradient-text">{user?.xpPoints?.toLocaleString() || 0}</div>
                                <p className="text-xs text-foreground-secondary">Total XP Points</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center">
                            <CardContent className="py-4">
                                <div className="text-2xl font-bold gradient-text">{user?.problemsSolved || 0}</div>
                                <p className="text-xs text-foreground-secondary">Problems Solved</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center">
                            <CardContent className="py-4">
                                <div className="text-2xl font-bold gradient-text">
                                    {formatDuration(user?.totalMinutesLearned || 0)}
                                </div>
                                <p className="text-xs text-foreground-secondary">Study Time</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center">
                            <CardContent className="py-4">
                                <div className="text-2xl font-bold gradient-text">
                                    {Math.round((user?.accuracy || 0) * 100)}%
                                </div>
                                <p className="text-xs text-foreground-secondary">Accuracy</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Edit Profile */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Profile Information</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => isEditing ? handleCancel() : setIsEditing(true)}>
                                {isEditing ? '✕ Cancel' : '✎ Edit'}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <form className="space-y-4" onSubmit={handleSave}>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <Input
                                            label="First Name"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                        <Input
                                            label="Last Name"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                    <Input label="Email" type="email" value={formData.email} disabled />
                                    <div className="flex gap-3">
                                        <Button type="submit" loading={isUpdating}>
                                            Save Changes
                                        </Button>
                                        <Button type="button" variant="secondary" onClick={handleCancel}>
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-foreground-secondary mb-1">First Name</p>
                                            <p className="font-medium">{user?.firstName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-foreground-secondary mb-1">Last Name</p>
                                            <p className="font-medium">{user?.lastName}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground-secondary mb-1">Email</p>
                                        <p className="font-medium">{user?.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground-secondary mb-1">Learning Level</p>
                                        <p className="font-medium flex items-center gap-2">
                                            {currentLevel && (
                                                <>
                                                    <span>{currentLevel.icon}</span>
                                                    {currentLevel.label} (Grades {currentLevel.grades})
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground-secondary mb-1">Language</p>
                                        <p className="font-medium">🇺🇸 English</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Achievements */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Achievements</CardTitle>
                            <span className="text-sm text-foreground-secondary">
                                {achievements.filter(a => a.unlocked).length}/{achievements.length} unlocked
                            </span>
                        </CardHeader>
                        <CardContent>
                            {isLoadingAchievements ? (
                                <div className="text-center py-8">
                                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                    <p className="text-sm text-foreground-secondary">Loading achievements...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {/* Dynamic achievements from API */}
                                    {achievements.map((ach) => (
                                        <div
                                            key={ach.id}
                                            className={`p-4 rounded-xl text-center transition-all ${ach.unlocked
                                                ? 'bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30'
                                                : 'bg-neutral-100 dark:bg-neutral-800 opacity-50'
                                                }`}
                                        >
                                            <div className={`text-3xl mb-2 ${!ach.unlocked && 'grayscale'}`}>
                                                {ach.icon}
                                            </div>
                                            <p className={`text-xs font-medium ${ach.unlocked ? '' : 'text-foreground-secondary'}`}>
                                                {ach.title}
                                            </p>
                                            <p className="text-xs text-foreground-secondary mt-1">
                                                {ach.description}
                                            </p>
                                            {!ach.unlocked && ach.progress !== undefined && (
                                                <div className="mt-2">
                                                    <Progress value={ach.progress} size="sm" />
                                                    <p className="text-xs text-foreground-secondary mt-1">
                                                        {Math.round(ach.progress * 100)}% complete
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    
                                    {/* Commented out remaining 4 achievements */}
                                    {/* 
                                    {[
                                        { id: 'ach-5', icon: '⭐', title: 'Perfect Score', unlocked: false },
                                        { id: 'ach-6', icon: '🦉', title: 'Night Owl', unlocked: false },
                                        { id: 'ach-7', icon: '∫', title: 'Calculus Champion', unlocked: false },
                                        { id: 'ach-8', icon: '⚡', title: 'Speed Demon', unlocked: false },
                                    ].map((ach) => (
                                        <div
                                            key={ach.id}
                                            className="p-4 rounded-xl text-center bg-neutral-100 dark:bg-neutral-800 opacity-50"
                                        >
                                            <div className="text-3xl mb-2 grayscale">
                                                {ach.icon}
                                            </div>
                                            <p className="text-xs font-medium text-foreground-secondary">
                                                {ach.title}
                                            </p>
                                        </div>
                                    ))}
                                    */}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.slice(0, 5).map((activity) => (
                                    <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${activity.type === 'lesson_completed'
                                                ? 'bg-green-100 dark:bg-green-900/30'
                                                : activity.type === 'problem_solved'
                                                    ? 'bg-blue-100 dark:bg-blue-900/30'
                                                    : 'bg-purple-100 dark:bg-purple-900/30'
                                                }`}
                                        >
                                            {activity.type === 'lesson_completed'
                                                ? '?'
                                                : activity.type === 'problem_solved'
                                                    ? '??'
                                                    : '??'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{activity.title}</p>
                                            <p className="text-xs text-foreground-secondary">
                                                {formatRelativeTime(activity.timestamp)}
                                            </p>
                                        </div>
                                        <Badge variant="success" className="text-xs">
                                            +{activity.xpEarned} XP
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

