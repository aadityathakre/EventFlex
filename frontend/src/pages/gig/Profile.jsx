import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Edit, Save, X, User, Mail, Phone, Award } from 'lucide-react';
import Layout from '../../components/Layout';
import { gigService } from '../../services/apiServices';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { defaultAvatars } from '../../utils/defaultAvatars';

const GigProfile = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    phone: '',
    upi_id: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: ''
  });
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchKycStatus();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await gigService.getProfile();
      setProfile(data);
      setEditForm({
        name: data.name || '',
        bio: data.bio || '',
        phone: data.phone || '',
        upi_id: data.bank_details?.upi_id || '',
        address: data.location?.address || '',
        city: data.location?.city || '',
        state: data.location?.state || '',
        country: data.location?.country || '',
        pincode: data.location?.pincode || ''
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
      setLoading(false);
    }
  };

  const fetchKycStatus = async () => {
    try {
      const { data } = await gigService.getKycStatus();
      setKycStatus(data.status);
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await gigService.updateProfile({ profile_image_url: formData });
      await fetchProfile();
      toast.success('Profile image updated');
    } catch (error) {
      console.error('Error updating profile image:', error);
      toast.error('Failed to update profile image');
    }
  };

  const handleUpdate = async () => {
    try {
      const updates = {
        name: editForm.name,
        bio: editForm.bio,
        phone: editForm.phone,
        bank_details: {
          upi_id: editForm.upi_id
        },
        location: {
          address: editForm.address,
          city: editForm.city,
          state: editForm.state,
          country: editForm.country,
          pincode: editForm.pincode
        }
      };

      await gigService.updateProfile(updates);
      await fetchProfile();
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading profile...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="gig">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => window.history.back()} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold dark:text-white text-gray-900">Profile</h1>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-teal"
          >
            {isEditing ? <Save className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
            {isEditing ? ' Save' : ' Edit'}
          </button>
        </div>

        {/* Profile Header Card */}
        <div className="card bg-gradient-to-r from-teal to-teal-dark text-white p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={profile?.profile_image_url || defaultAvatars.gig}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
              {!isEditing ? null : (
                <label className="absolute bottom-0 right-0 p-1 bg-yellow-400 rounded-full cursor-pointer">
                  <Camera className="w-4 h-4 text-gray-900" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    className="input bg-teal-dark/50 border-0 text-white placeholder-white/70"
                    placeholder="Your name"
                  />
                ) : (
                  profile?.name
                )}
              </h2>
              <p className="opacity-90">@{user?.username}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="badge bg-yellow-400 text-gray-900">Gig Worker</span>
                <span className={`badge ${
                  kycStatus === 'verified' ? 'bg-green-500' : 'bg-gray-500'
                }`}>
                  {kycStatus === 'verified' ? 'KYC Verified' : 'KYC Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bio & Contact */}
          <div className="card space-y-6">
            <div>
              <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-3">Bio</h3>
              {isEditing ? (
                <textarea
                  value={editForm.bio}
                  onChange={e => setEditForm({...editForm, bio: e.target.value})}
                  className="input w-full h-24"
                  placeholder="Tell us about yourself"
                />
              ) : (
                <p className="dark:text-gray-300 text-gray-700">{profile?.bio || 'No bio added yet'}</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-3">Contact Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium dark:text-gray-300 text-gray-700">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={e => setEditForm({...editForm, phone: e.target.value})}
                      className="input w-full mt-1"
                      placeholder="Your phone number"
                    />
                  ) : (
                    <p className="dark:text-gray-300 text-gray-700">{profile?.phone || 'Not added'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium dark:text-gray-300 text-gray-700">Email</label>
                  <p className="dark:text-gray-300 text-gray-700">{profile?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Payment */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-3">Location</h3>
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={e => setEditForm({...editForm, address: e.target.value})}
                      className="input w-full"
                      placeholder="Address"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={editForm.city}
                        onChange={e => setEditForm({...editForm, city: e.target.value})}
                        className="input w-full"
                        placeholder="City"
                      />
                      <input
                        type="text"
                        value={editForm.state}
                        onChange={e => setEditForm({...editForm, state: e.target.value})}
                        className="input w-full"
                        placeholder="State"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={editForm.country}
                        onChange={e => setEditForm({...editForm, country: e.target.value})}
                        className="input w-full"
                        placeholder="Country"
                      />
                      <input
                        type="text"
                        value={editForm.pincode}
                        onChange={e => setEditForm({...editForm, pincode: e.target.value})}
                        className="input w-full"
                        placeholder="PIN Code"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <p className="dark:text-gray-300 text-gray-700">{profile?.location?.address || 'No address added'}</p>
                    <p className="dark:text-gray-300 text-gray-700">
                      {[profile?.location?.city, profile?.location?.state].filter(Boolean).join(', ')}
                    </p>
                    <p className="dark:text-gray-300 text-gray-700">
                      {[profile?.location?.country, profile?.location?.pincode].filter(Boolean).join(' - ')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-3">Payment Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium dark:text-gray-300 text-gray-700">UPI ID</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.upi_id}
                      onChange={e => setEditForm({...editForm, upi_id: e.target.value})}
                      className="input w-full mt-1"
                      placeholder="Your UPI ID"
                    />
                  ) : (
                    <p className="dark:text-gray-300 text-gray-700">{profile?.bank_details?.upi_id || 'Not added'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Update Profile Button (when editing) */}
        {isEditing && (
          <div className="flex justify-end gap-4">
            <button
              onClick={() => {
                setIsEditing(false);
                fetchProfile(); // Reset form
              }}
              className="btn btn-outline"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button onClick={handleUpdate} className="btn btn-teal">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GigProfile;

