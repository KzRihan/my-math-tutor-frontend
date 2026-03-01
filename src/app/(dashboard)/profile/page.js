'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { recentActivity } from '@/data/users';
import { getInitials, formatRelativeTime, formatDuration } from '@/lib/utils';
import { useGetMeQuery, useUpdateProfileMutation } from '@/store/userApi';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '@/store/authSlice';
import { useToast } from '@/components/providers/ToastProvider';

const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8001';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const toast = useToast();

  const { data: userData, isLoading } = useGetMeQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const reduxUser = useSelector((state) => state.auth.user);
  const user = userData?.data || reduxUser;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

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
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (jpg, png, gif, webp)');
      return;
    }

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
        toast.success('Profile updated successfully');
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

  const getProfileImageUrl = () => {
    if (imagePreview) return imagePreview;
    if (user?.profileImage) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold mb-2">My Profile</h1>
          <p className="text-foreground-secondary">View and manage your profile information</p>
        </div>
        <Link href="/settings">
          <Button variant="secondary">Settings</Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="text-center">
            <CardContent className="py-8">
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
                    <Image src={profileImageUrl} alt="Profile" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-3xl">
                      {getInitials(user?.firstName, user?.lastName)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-2xl">{'📷'}</span>
                  </div>
                </button>
              </div>

              <h2 className="text-xl font-bold">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-foreground-secondary text-sm mb-4">{user?.email}</p>
              <p className="text-xs text-foreground-secondary">
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
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="py-4">
                <div className="text-2xl font-bold gradient-text">{user?.problemsSolved || 0}</div>
                <p className="text-xs text-foreground-secondary">Problems Solved</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-4">
                <div className="text-2xl font-bold gradient-text">{formatDuration(user?.totalMinutesLearned || 0)}</div>
                <p className="text-xs text-foreground-secondary">Study Time</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-4">
                <div className="text-2xl font-bold gradient-text">{Math.round((user?.accuracy || 0) * 100)}%</div>
                <p className="text-xs text-foreground-secondary">Accuracy</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Profile Information</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}>
                {isEditing ? 'Cancel' : 'Edit'}
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
                    <p className="text-sm text-foreground-secondary mb-1">Language</p>
                    <p className="font-medium">English</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-blue-100 dark:bg-blue-900/30">
                      {'📝'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-foreground-secondary">{formatRelativeTime(activity.timestamp)}</p>
                    </div>
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
