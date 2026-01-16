import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Save, Edit2, CheckCircle, Camera, AlertCircle, Phone, CreditCard } from 'lucide-react';
import { updateUserProfile, getUserProfile, subscribeToUserProfile, uploadUserAvatar, getUserAvatarUrl } from '../../lib/supabase/database';

export function UserDashboard({ authUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    government_id: '',
    id_type: 'aadhaar',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!authUser?.id) return;

      try {
        setLoading(true);
        const profile = await getUserProfile(authUser.id);
        const avatarUrl = getUserAvatarUrl(authUser.id);
        setPreview(avatarUrl || null);

        if (profile) {
          setFormData({
            full_name: profile.full_name || '',
            email: profile.email || authUser.email || '',
            phone: profile.phone || '',
            address: profile.address || '',
            city: profile.city || '',
            state: profile.state || '',
            pincode: profile.pincode || '',
            government_id: profile.government_id || '',
            id_type: profile.id_type || 'aadhaar',
          });
        } else {
          setFormData({
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
            email: authUser.email || '',
            phone: '',
            address: '',
            city: '',
            state: '',
            pincode: '',
            government_id: '',
            id_type: 'aadhaar',
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setFormData({
          full_name: authUser.user_metadata?.full_name || '',
          email: authUser.email || '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          government_id: '',
          id_type: 'aadhaar',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    if (authUser?.id) {
      const subscription = subscribeToUserProfile(authUser.id, (updatedProfile) => {
        if (updatedProfile) {
          setFormData(prev => ({
            ...prev,
            full_name: updatedProfile.full_name || prev.full_name,
            phone: updatedProfile.phone || prev.phone,
            address: updatedProfile.address || prev.address,
            city: updatedProfile.city || prev.city,
            state: updatedProfile.state || prev.state,
            pincode: updatedProfile.pincode || prev.pincode,
            government_id: updatedProfile.government_id || prev.government_id,
            id_type: updatedProfile.id_type || prev.id_type,
          }));
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [authUser?.email, authUser?.id, authUser?.user_metadata?.full_name, authUser?.user_metadata?.name]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const convertJpegToPng = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (!blob) return reject(new Error('Conversion to PNG failed'));
              const fileName = file.name.replace(/\.jpe?g$/i, '.png');
              const pngFile = new File([blob], fileName, { type: 'image/png' });
              resolve(pngFile);
            }, 'image/png');
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = (err) => reject(err);
        img.src = reader.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let selectedFile = file;

    const isJpeg = file.type === 'image/jpeg' || /\.jpe?g$/i.test(file.name);
    if (isJpeg) {
      try {
        selectedFile = await convertJpegToPng(file);
      } catch (err) {
        console.error('Failed to convert JPEG to PNG:', err);
        setMessage({ type: 'error', text: 'Failed to convert image. Please try another format.' });
        return;
      }
    }

    setImageFile(selectedFile);
    if (preview) {
      try { URL.revokeObjectURL(preview); } catch (e) { }
    }
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      if (imageFile && authUser?.id) {
        try {
          await uploadUserAvatar(authUser.id, imageFile);
          setPreview(getUserAvatarUrl(authUser.id));
          setImageFile(null);
        } catch (uploadError) {
          console.error('Avatar upload failed:', uploadError);
          setMessage({
            type: 'error',
            text: 'Profile updated but avatar upload failed. Please try again.'
          });
        }
      }

      await updateUserProfile(authUser.id, formData);

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-200 text-lg font-medium animate-pulse">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Animated Header Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl shadow-2xl p-8 mb-8 transform transition-all duration-500 hover:shadow-emerald-500/20">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl"></div>

          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar Section with Animation */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover border-4 border-white/50 shadow-xl transform transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-300 to-teal-300 border-4 border-white/50 shadow-xl flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105">
                    <span className="text-4xl font-bold text-white">
                      {getInitials(formData.full_name)}
                    </span>
                  </div>
                )}

                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                    <Camera className="w-8 h-8 text-white transform transition-transform duration-300 group-hover:scale-110" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* User Info with Animation */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-4xl font-bold text-white mb-2 transform transition-all duration-300">
                {formData.full_name || 'Welcome Back'}
              </h1>
              <p className="text-emerald-50 flex items-center justify-center sm:justify-start gap-2 text-lg">
                <Mail className="w-5 h-5" />
                {formData.email}
              </p>
            </div>

            {/* Edit Button with Animation */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="group relative overflow-hidden bg-white text-emerald-600 px-8 py-3 rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Edit2 className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                  Edit Profile
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            )}
          </div>
        </div>

        {/* Success/Error Messages with Animation */}
        {message && (
          <div
            className={`mb-6 p-5 rounded-2xl border backdrop-blur-sm transform transition-all duration-500 animate-slideDown ${message.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-100 shadow-lg shadow-emerald-500/20'
              : 'bg-rose-500/20 border-rose-400/50 text-rose-100 shadow-lg shadow-rose-500/20'
              }`}
          >
            <div className="flex items-center gap-3">
              {message.type === 'success' ? (
                <CheckCircle className="w-6 h-6 animate-bounce" />
              ) : (
                <AlertCircle className="w-6 h-6 animate-pulse" />
              )}
              <span className="font-semibold text-lg">{message.text}</span>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500">
          <div className="p-8 sm:p-10">
            {/* Personal Information Section */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="group transform transition-all duration-300 hover:translate-y-[-2px]">
                  <label className="block text-sm font-semibold text-emerald-100 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 placeholder-slate-400"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div className="group transform transition-all duration-300 hover:translate-y-[-2px]">
                  <label className="block text-sm font-semibold text-emerald-100 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full bg-white/5 border border-white/10 text-slate-300 rounded-xl px-4 py-3.5 opacity-60 cursor-not-allowed"
                  />
                </div>

                {/* Phone */}
                <div className="group transform transition-all duration-300 hover:translate-y-[-2px]">
                  <label className="block text-sm font-semibold text-emerald-100 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 placeholder-slate-400"
                      placeholder="+91 1234567890"
                    />
                  </div>
                </div>

                {/* ID Type */}
                <div className="group transform transition-all duration-300 hover:translate-y-[-2px]">
                  <label className="block text-sm font-semibold text-emerald-100 mb-2">
                    ID Type
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <select
                      name="id_type"
                      value={formData.id_type}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 appearance-none cursor-pointer"
                    >
                      <option value="aadhaar" className="bg-slate-800">Aadhaar Card</option>
                      <option value="pan" className="bg-slate-800">PAN Card</option>
                      <option value="passport" className="bg-slate-800">Passport</option>
                      <option value="driving_license" className="bg-slate-800">Driving License</option>
                    </select>
                  </div>
                </div>

                {/* Government ID */}
                <div className="md:col-span-2 group transform transition-all duration-300 hover:translate-y-[-2px]">
                  <label className="block text-sm font-semibold text-emerald-100 mb-2">
                    Government ID Number
                  </label>
                  <input
                    type="text"
                    name="government_id"
                    value={formData.government_id}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 placeholder-slate-400"
                    placeholder="Enter your government ID"
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Address Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Address */}
                <div className="md:col-span-2 group transform transition-all duration-300 hover:translate-y-[-2px]">
                  <label className="block text-sm font-semibold text-emerald-100 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 placeholder-slate-400"
                    placeholder="House no., Street name"
                  />
                </div>

                {/* City */}
                <div className="group transform transition-all duration-300 hover:translate-y-[-2px]">
                  <label className="block text-sm font-semibold text-emerald-100 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 placeholder-slate-400"
                    placeholder="Your city"
                  />
                </div>

                {/* State */}
                <div className="group transform transition-all duration-300 hover:translate-y-[-2px]">
                  <label className="block text-sm font-semibold text-emerald-100 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 placeholder-slate-400"
                    placeholder="Your state"
                  />
                </div>

                {/* Pincode */}
                <div className="md:col-span-2 group transform transition-all duration-300 hover:translate-y-[-2px]">
                  <label className="block text-sm font-semibold text-emerald-100 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 placeholder-slate-400"
                    placeholder="6-digit pincode"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                >
                  <Save className={`w-5 h-5 ${saving ? 'animate-spin' : 'group-hover:animate-bounce'}`} />
                  <span className="text-lg">{saving ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsEditing(false);
                    setImageFile(null);
                  }}
                  disabled={saving}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold transition-all duration-300 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                >
                  <span className="text-lg">Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }

        input::placeholder,
        select::placeholder {
          color: rgb(148 163 184 / 0.5);
        }

        select option {
          background-color: rgb(30 41 59);
          color: white;
        }
      `}</style>
    </div>
  );
}