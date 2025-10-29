import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/userService';

const Profile = () => {
  const { user, fetchUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ fullname: '', phone: '' });

  useEffect(() => {
    if (user) {
      setFormData({ fullname: user.fullname, phone: user.phone });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
      fetchUser(); // Refetch user data to update the context
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-amber-900 mb-8">My Profile</h1>
      <div className="bg-white rounded-lg shadow p-8">
        {!isEditing ? (
          <div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
              <p className="text-gray-900">{user.fullname}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
              <p className="text-gray-900">{user.phone}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
              <p className="text-gray-900">{user.role}</p>
            </div>
            <button onClick={() => setIsEditing(true)} className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
