import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { gigService } from '../../services/apiServices';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Award } from 'lucide-react';

const GigProfile = () => {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await gigService.getProfile();
      setProfile(data.data);
    } catch (error) {
      console.error('Failed to load profile', error);
    } finally {
      setLoading(false);
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
    <Layout>
      <div className="max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>

        <div className="card">
          <div className="flex items-center space-x-6 mb-6">
            <img
              src={profile?.avatar || user?.avatar || '/placeholder-avatar.png'}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold">
                {profile?.first_name || user?.first_name} {profile?.last_name || user?.last_name}
              </h2>
              <p className="text-gray-600">@{profile?.universal_role_id || user?.universal_role_id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{profile?.email || user?.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{profile?.phone || user?.phone}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium capitalize">{profile?.role || user?.role}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Award className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">KYC Status</p>
                <p className="font-medium">
                  {profile?.kycVideo?.status || 'Not verified'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GigProfile;

