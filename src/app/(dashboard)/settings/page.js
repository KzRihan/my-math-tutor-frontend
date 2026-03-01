'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { getInitials } from '@/lib/utils';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useGetMeQuery, useUpdateProfileMutation } from '@/store/userApi';
import { useLogoutMutation } from '@/store/authApi';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, logout } from '@/store/authSlice';
import { useToast } from '@/components/providers/ToastProvider';
import { FaUser, FaCog, FaCamera, FaCheck, FaSun, FaMoon, FaDesktop } from 'react-icons/fa';


const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8001';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, setTheme } = useTheme();
  const dispatch = useDispatch();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch user data from API
  const { data: userData, isLoading } = useGetMeQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [logoutMutation] = useLogoutMutation();

  // Get user from API or fallback to Redux state
  const reduxUser = useSelector((state) => state.auth.user);
  const user = userData?.data || reduxUser;

  // Local form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });

  // Initialize form state when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
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

  // Get profile image URL
  const getProfileImageUrl = () => {
    if (imagePreview) return imagePreview;
    if (user?.profileImage) {
      if (user.profileImage.startsWith('http')) return user.profileImage;
      return `${SERVER_BASE_URL}${user.profileImage}`;
    }
    return null;
  };

  const profileImageUrl = getProfileImageUrl();

  const handleSaveProfile = async () => {
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
        setSelectedFile(null);
        setImagePreview(null);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };


  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.warn('Logout API call failed, clearing local session anyway:', error);
    }

    dispatch(logout());
    toast.success('Logged out successfully');
    router.replace('/login');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'preferences', label: 'Preferences', icon: FaCog },
  ];

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground-secondary">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-2xl lg:text-3xl font-display font-bold mb-2">
          <span className="inline-flex items-center gap-2">
            <FaCog className="text-primary-500" />
            Settings
          </span>
        </h1>
        <div className="sm:text-right">
          <p className="text-foreground-secondary mb-3">
            Manage your account and preferences
          </p>
          <Button
            variant="danger"
            onClick={handleLogout}
            loading={isLoggingOut}
            className="w-full sm:w-auto sm:min-w-[140px]"
          >
            {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <Card className="p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar with upload */}
                  <div className="flex items-center gap-6">
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
                      className="relative w-20 h-20 rounded-full overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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
                        <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl">
                          {getInitials(user?.firstName, user?.lastName)}
                        </div>
                      )}
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaCamera className="text-white text-xl" />
                      </div>
                    </button>
                    <div>
                      <Button variant="secondary" size="sm" onClick={handleImageClick}>
                        Upload Photo
                      </Button>
                      <p className="text-xs text-foreground-secondary mt-2">
                        JPG, PNG, GIF or WebP. Max 5MB.
                      </p>
                      {selectedFile && (
                        <p className="text-xs text-primary-500 mt-1">
                          <span className="inline-flex items-center gap-1">
                            <FaCheck />
                            New image selected - click Save to apply
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Form */}
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
                    <Input
                      label="Email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="md:col-span-2"
                    />
                  </div>

                  <Button onClick={handleSaveProfile} loading={isUpdating}>
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

            </>
          )}

          {activeTab === 'preferences' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'light', label: 'Light', icon: FaSun },
                      { value: 'dark', label: 'Dark', icon: FaMoon },
                      { value: 'system', label: 'System', icon: FaDesktop },
                    ].map((themeOption) => (
                      <button
                        key={themeOption.value}
                        onClick={() => setTheme(themeOption.value)}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${theme === themeOption.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                          : 'border-[var(--card-border)] hover:border-primary-300'
                          }`}
                      >
                        <themeOption.icon className="text-2xl mx-auto" />
                        <p className="font-medium mt-2">{themeOption.label}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

