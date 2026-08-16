import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, ShieldCheck, Edit2, X, CheckCircle, Award, UserCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const rawRole = (user?.role || '').toUpperCase().replace(/^ROLE_/, '');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ username: user?.username || '', email: user?.email || '' });

    const roleLabel = rawRole === 'ADMIN' ? 'Administrator' : rawRole === 'TEACHER' ? 'Faculty Member' : 'Student';
    const roleBadgeCls = rawRole === 'ADMIN' ? 'badge badge-indigo' : rawRole === 'TEACHER' ? 'badge badge-purple' : 'badge badge-emerald';

    const openModal = () => {
        setFormData({ username: user?.username || '', email: user?.email || '' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/users/${user.id}`, formData);
            toast.success('Profile updated successfully');
            const updated = { ...user, username: res.data.username, email: res.data.email };
            localStorage.setItem('user', JSON.stringify(updated));
            setTimeout(() => window.location.reload(), 700);
            setIsModalOpen(false);
        } catch {
            toast.error('Failed to update profile');
        }
    };

    const infoItems = [
        { icon: Mail,        label: 'Email Address',  value: user?.email,          cls: 'text-indigo-500' },
        { icon: User,        label: 'Username',       value: `@${user?.username}`, cls: 'text-indigo-500' },
        { icon: Award,       label: 'Account Role',   value: roleLabel,            cls: 'text-purple-500' },
        { icon: CheckCircle, label: 'Account Status', value: 'Verified & Active', cls: 'text-emerald-500' },
    ];

    const initial = (user?.username || 'U').charAt(0).toUpperCase();

    return (
        <>
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title flex items-center gap-2">
                    <UserCircle className="w-6 h-6 text-indigo-500" />
                    My <span className="gradient-text">Profile</span>
                </h1>
                <p className="page-subtitle">Personal account overview & credentials</p>
            </div>

            {/* Profile Card */}
            <div className="section-card">
                {/* Cover Banner */}
                <div className="h-32 gradient-bg relative">
                    <div className="absolute inset-0 opacity-20"
                         style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                </div>

                {/* Profile Body */}
                <div className="px-6 pb-6 relative">
                    {/* Avatar & Edit Button */}
                    <div className="flex items-end justify-between -mt-12 mb-5 relative z-10">
                        <div className="w-22 h-22 rounded-2xl gradient-bg border-4 border-white shadow-xl flex items-center justify-center text-white text-3xl font-black shrink-0 leading-none">
                            {initial}
                        </div>
                        <button onClick={openModal} className="btn-secondary gap-2 mb-1 shadow-sm">
                            <Edit2 className="w-3.5 h-3.5 text-indigo-500" /> Edit Profile
                        </button>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-extrabold text-slate-900">{user?.username}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="badge badge-emerald">
                                <ShieldCheck className="w-3 h-3 mr-1" /> Active Session
                            </span>
                            <span className={roleBadgeCls}>{roleLabel}</span>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Account Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {infoItems.map(({ icon: Icon, label, value, cls }) => (
                                <div key={label} className="flex items-start gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="p-2 rounded-xl bg-white shadow-xs border border-slate-100 shrink-0 mt-0.5">
                                        <Icon className={`w-4 h-4 ${cls}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                                        <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Edit Profile Modal */}
        {isModalOpen && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
                    <div className="modal-box" style={{ maxWidth: '440px' }}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900">Edit Profile</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Update your username and email</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Username <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text" required
                                        value={formData.username}
                                        onChange={e => setFormData({...formData, username: e.target.value})}
                                        className="w-full px-3 py-2.5 glass-input rounded-xl"
                                        placeholder="Your username"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address <span className="text-rose-500">*</span></label>
                                    <input
                                        type="email" required
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        className="w-full px-3 py-2.5 glass-input rounded-xl"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-[20px]">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Profile;
