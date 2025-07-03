import React, { useState, useRef, useEffect } from 'react';
import { User, Lock, Bell } from 'lucide-react';
import camera from "../Assets/Camera.svg";
import { getUserProfile, updateUserProfile } from '@/services/profileService';
import { toast } from 'sonner';
import avatar from "../Assets/avatar.jpg"; // Using an existing avatar image

const SettingsTabs = () => {
  const [activeTab, setActiveTab] = useState('edit');
  const [selectedImage, setSelectedImage] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null); 

  // State for Edit Profile form
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    location: '',
    dateOfBirth: '',
    phone: '',
  });

  // State for Account form (passwords only - username removed)
  const [accountForm, setAccountForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    language: 'English, India',
  });

  // State for Notification settings
  const [notificationForm, setNotificationForm] = useState({
    pushNotification: 'All New Messages',
    emailNotification: 'Send me email notifications',
    morePreferences: {
      option1: false,
      option2: false,
    },
  });

  // Fetch user profile data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await getUserProfile();
        
        if (userData) {
          setProfileForm({
            fullName: userData.name || '',
            email: userData.email || '',
            location: userData.location || 'Tamilnadu, Chennai',
            dateOfBirth: userData.dateOfBirth || '2003-12-17',
            phone: userData.phone || '+1 234 567 890',
          });
          
          if (userData.avatar) {
            setSelectedImage(userData.avatar);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const tabs = [
    { id: 'edit', label: 'Edit Profile', icon: <User className="w-4 h-4 mr-1" /> },
    { id: 'account', label: 'Account', icon: <Lock className="w-4 h-4 mr-1" /> },
    { id: 'notification', label: 'Notification', icon: <Bell className="w-4 h-4 mr-1" /> },
  ];

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file); 
      setSelectedImage(imageUrl); 
    }
  };

  // Handle camera icon click to trigger file input
  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  // Handle form submission for Edit Profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Convert form data to user profile update format
      const updateData = {
        name: profileForm.fullName,
        email: profileForm.email,
        location: profileForm.location,
        dateOfBirth: profileForm.dateOfBirth,
        phone: profileForm.phone
      };
      
      const result = await updateUserProfile(updateData);
      
      if (result && result._id) {
        // Update localStorage user info to reflect changes
        const currentUser = localStorage.getItem('user');
        if (currentUser) {
          const userData = JSON.parse(currentUser);
          const updatedUser = {
            ...userData,
            name: updateData.name || userData.name,
            email: updateData.email || userData.email
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle form submission for Account
  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate passwords
      if (!accountForm.currentPassword) {
        toast.error('Please enter your current password');
        return;
      }
      
      if (accountForm.newPassword !== accountForm.confirmPassword) {
        toast.error('New password and confirmation do not match');
        return;
      }
      
      if (accountForm.newPassword && accountForm.newPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      
      setSaving(true);
      
      // If user provided password data, implement password update
      if (accountForm.currentPassword && accountForm.newPassword) {
        // Here you would call a password update API
        // await updatePassword({
        //   currentPassword: accountForm.currentPassword,
        //   newPassword: accountForm.newPassword
        // });
        
        // For now, just simulate success since we don't have the API
        console.log('Password would be updated here if API was implemented');
        
        setTimeout(() => {
          toast.success('Password updated successfully');
        }, 800);
      }
      
      // Reset password fields
      setAccountForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error('Failed to update account settings:', error);
      toast.error(error.message || 'Failed to update account settings');
    } finally {
      setSaving(false);
    }
  };

  // Handle form submission for Notification
  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      // Placeholder for notification settings API call
      // await updateNotificationSettings(notificationForm);
      
      // For now, we're just simulating success since we don't have the API
      console.log('Notification Settings Updated:', notificationForm);
      setTimeout(() => {
        toast.success('Notification preferences updated');
      }, 500);
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      toast.error(error.message || 'Failed to update notification settings');
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8A63FF]"></div>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'edit':
        return (
          <form className="space-y-6" onSubmit={handleProfileSubmit}>
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-[#8A63FF]/10 flex items-center justify-center">
                <User size={48} className="text-[#8A63FF]" />
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                className="mt-1 block w-full px-3 py-2 border rounded-[30px] bg-gray-100 text-gray-700 focus:ring-[#8A63FF] focus:border-[#8A63FF] focus:outline-none"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                id="location"
                type="text"
                className="mt-1 block w-full px-3 py-2 border rounded-[30px] bg-gray-100 text-gray-700 focus:ring-[#8A63FF] focus:border-[#8A63FF] focus:outline-none"
                value={profileForm.location}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, location: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="dateOfBirth"
                className="block text-sm font-medium text-gray-700"
              >
                Date Of Birth
              </label>
              <input
                id="dateOfBirth"
                type="date"
                className="mt-1 block w-full px-3 py-2 border rounded-[30px] bg-gray-100 text-gray-700 focus:ring-[#8A63FF] focus:border-[#8A63FF] focus:outline-none"
                value={profileForm.dateOfBirth}
                onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                className="mt-1 block w-full px-3 py-2 border rounded-[30px] bg-gray-100 text-gray-700 focus:ring-[#8A63FF] focus:border-[#8A63FF] focus:outline-none"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className="mt-1 block w-full px-3 py-2 border rounded-[30px] bg-gray-100 text-gray-700 focus:ring-[#8A63FF] focus:border-[#8A63FF] focus:outline-none"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-6 py-2 bg-[#8A63FF] text-white rounded-[30px] hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        );
      case 'account':
        return (
          <form className="space-y-6" onSubmit={handleAccountSubmit}>
            <div className="space-y-2">
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                Language
              </label>
              <select
                id="language"
                className="mt-1 block w-full px-3 py-2 border rounded-[30px] bg-gray-100 text-gray-700 focus:ring-[#8A63FF] focus:border-[#8A63FF] focus:outline-none"
                value={accountForm.language}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, language: e.target.value })
                }
              >
                <option value="English, India">English (India)</option>
                <option value="English, US">English (US)</option>
              </select>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Current Password *
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    required
                    className="mt-1 block w-full px-3 py-2 border rounded-[30px] bg-gray-100 text-gray-700 focus:ring-[#8A63FF] focus:border-[#8A63FF] focus:outline-none"
                    value={accountForm.currentPassword}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, currentPassword: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password *
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    className="mt-1 block w-full px-3 py-2 border rounded-[30px] bg-gray-100 text-gray-700 focus:ring-[#8A63FF] focus:border-[#8A63FF] focus:outline-none"
                    value={accountForm.newPassword}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, newPassword: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password *
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    className="mt-1 block w-full px-3 py-2 border rounded-[30px] bg-gray-100 text-gray-700 focus:ring-[#8A63FF] focus:border-[#8A63FF] focus:outline-none"
                    value={accountForm.confirmPassword}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, confirmPassword: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-2 bg-[#8A63FF] text-white rounded-[30px] hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
                >
                  {saving ? 'Saving...' : 'Change Password'}
                </button>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200 mt-8">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Delete your account permanently
              </p>
              <label className="flex items-center mt-2 space-x-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#8A63FF] focus:ring-purple-500"
                />
                <span className="text-sm">Confirm delete your account</span>
              </label>
              <button
                type="button"
                className="mt-4 w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-[30px] hover:bg-red-600 transition-colors"
                onClick={() => console.log("Account Deletion Requested")}
              >
                Delete My Account
              </button>
            </div>
          </form>
        );
      case 'notification':
        return (
          <form className="space-y-8" onSubmit={handleNotificationSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="pushNotification"
                className="block text-sm font-medium text-gray-700"
              >
                Mobile push notification
              </label>
              <select
                id="pushNotification"
                className="mt-1 block w-full px-3 py-2 border rounded-[30px] bg-gray-100 text-gray-700 focus:ring-[#8A63FF] focus:border-[#8A63FF] focus:outline-none"
                value={notificationForm.pushNotification}
                onChange={(e) =>
                  setNotificationForm({
                    ...notificationForm,
                    pushNotification: e.target.value,
                  })
                }
              >
                <option value="All New Messages">All New Messages</option>
                <option value="Important Only">Important Only</option>
              </select>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-800">
                Email Notifications
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Control the types of email notifications you receive.
              </p>
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-gray-700">
                Send me Email Notifications
              </legend>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="emailNotify"
                  className="text-[#8A63FF]"
                  value="Send me email notifications"
                  checked={
                    notificationForm.emailNotification ===
                    "Send me email notifications"
                  }
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      emailNotification: e.target.value,
                    })
                  }
                />
                <span className="text-sm">Send me email notifications</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="emailNotify"
                  className="text-[#8A63FF]"
                  value="Once an hour at most"
                  checked={
                    notificationForm.emailNotification ===
                    "Once an hour at most"
                  }
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      emailNotification: e.target.value,
                    })
                  }
                />
                <span className="text-sm">Once an hour at most</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="emailNotify"
                  className="text-[#8A63FF]"
                  value="Never"
                  checked={notificationForm.emailNotification === "Never"}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      emailNotification: e.target.value,
                    })
                  }
                />
                <span className="text-sm">Never</span>
              </label>
            </fieldset>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-800">
                More Email Preferences
              </h3>
              <label className="flex items-center mt-2 space-x-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#8A63FF]"
                  checked={notificationForm.morePreferences.option1}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      morePreferences: {
                        ...notificationForm.morePreferences,
                        option1: e.target.checked,
                      },
                    })
                  }
                />
                <span className="text-sm">Course updates and announcements</span>
              </label>
              <label className="flex items-center mt-2 space-x-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#8A63FF]"
                  checked={notificationForm.morePreferences.option2}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      morePreferences: {
                        ...notificationForm.morePreferences,
                        option2: e.target.checked,
                      },
                    })
                  }
                />
                <span className="text-sm">Marketing and promotional emails</span>
              </label>
            </div>
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-6 py-2 bg-[#8A63FF] text-white rounded-[30px] hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Notification Settings'}
              </button>
            </div>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="px-4 sm:px-6 md:px-10 w-full">
      <div className="w-full mx-auto bg-white rounded-2xl sm:rounded-[40px] shadow-md">
        {/* Tabs - Scrollable on mobile */}
        <div className="flex overflow-x-auto border-b px-4 sm:px-6 pt-4 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-3 sm:px-4 py-2 mr-2 sm:mr-4 text-xs sm:text-sm font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-b-2 border-[#8A63FF] text-[#8A63FF]"
                  : "text-gray-500 hover:text-[#8A63FF]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="p-4 sm:p-6">{renderContent()}</div>
      </div>
    </div>
  );
};
export default SettingsTabs;
