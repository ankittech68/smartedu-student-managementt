import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Shield, ShieldCheck, Edit2, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, login } = useContext(AuthContext); // Assuming login can update context or we can just update localStorage
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || ''
    });
    
    // We update local state to reflect changes instantly, or reload page.
    // AuthContext usually needs to be re-initialized. Let's just update localStorage for now and reload to be safe.
    
    const openModal = () => {
        setFormData({
            username: user?.username || '',
            email: user?.email || ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(`/users/${user.id}`, formData);
            toast.success('Profile updated successfully');
            
            // Update local storage user data
            const updatedUser = { ...user, username: response.data.username, email: response.data.email };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // For a complete state refresh, we just reload
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
            closeModal();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        }
    };

    return (
        <div className="max-w-3xl mx-auto relative">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-32 relative"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center text-4xl font-bold text-primary-600 uppercase">
                            {user?.username?.charAt(0)}
                        </div>
                        <button 
                            onClick={openModal}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm flex items-center"
                        >
                            <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{user?.username}</h2>
                            <div className="flex items-center mt-2 text-sm text-gray-500 space-x-4">
                                <span className="flex items-center"><ShieldCheck className="w-4 h-4 mr-1 text-green-500" /> Active Account</span>
                                <span className="flex items-center px-2 py-1 bg-primary-50 text-primary-700 rounded-md font-semibold text-xs uppercase tracking-wider">
                                    {user?.role?.replace('ROLE_', '')}
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start">
                                    <Mail className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Email Address</p>
                                        <p className="text-sm text-gray-500">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <User className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Username</p>
                                        <p className="text-sm text-gray-500">@{user?.username}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Shield className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Permissions Level</p>
                                        <p className="text-sm text-gray-500">{user?.role?.replace('ROLE_', '')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white">
                            <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input 
                                    type="text" 
                                    name="username" 
                                    value={formData.username} 
                                    onChange={handleInputChange} 
                                    required 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleInputChange} 
                                    required 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" 
                                />
                            </div>
                            
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
