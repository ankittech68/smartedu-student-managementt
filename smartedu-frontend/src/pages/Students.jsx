import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        enrollmentDate: '',
        phone: '',
        address: ''
    });

    const [unassignedUsers, setUnassignedUsers] = useState([]);

    const fetchStudents = async () => {
        try {
            const response = await api.get('/students');
            setStudents(response.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch students');
            setLoading(false);
        }
    };

    const fetchUnassignedUsers = async () => {
        try {
            const response = await api.get('/users/students/unassigned');
            setUnassignedUsers(response.data);
        } catch (error) {
            console.error('Failed to load unassigned users', error);
        }
    };

    useEffect(() => {
        fetchStudents();
        if (user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') {
            fetchUnassignedUsers();
        }
    }, [user]);

    const openModal = (student = null) => {
        if (student) {
            setIsEdit(true);
            setFormData({
                ...student,
                dateOfBirth: student.dateOfBirth || '',
                enrollmentDate: student.enrollmentDate || '',
                userId: student.user?.id || ''
            });
        } else {
            setIsEdit(false);
            setFormData({
                id: null,
                firstName: '',
                lastName: '',
                dateOfBirth: '',
                enrollmentDate: '',
                phone: '',
                address: '',
                userId: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (payload.userId) {
                payload.user = { id: payload.userId };
            }
            delete payload.userId;

            if (isEdit) {
                await api.put(`/students/${formData.id}`, payload);
                toast.success('Student updated successfully');
            } else {
                await api.post('/students', payload);
                toast.success('Student added successfully');
            }
            fetchStudents();
            if (user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') {
                fetchUnassignedUsers();
            }
            closeModal();
        } catch (error) {
            console.error(error);
            toast.error(isEdit ? 'Failed to update student' : 'Failed to add student');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await api.delete(`/students/${id}`);
                toast.success('Student deleted successfully');
                fetchStudents();
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete student');
            }
        }
    };

    if (loading) return <div className="p-8 text-center">Loading students...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">Students Directory</h2>
                {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
                    <button 
                        onClick={() => openModal()}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Student
                    </button>
                )}
            </div>
            
            <div className="p-4 border-b border-gray-100 bg-white">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Search students..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider border-b border-gray-200">
                            <th className="px-6 py-4 font-semibold">ID</th>
                            <th className="px-6 py-4 font-semibold">Name</th>
                            <th className="px-6 py-4 font-semibold">Enrollment Date</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                    No students found.
                                </td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-600">#{student.id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {student.firstName} {student.lastName}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{student.enrollmentDate}</td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
                                            <button 
                                                onClick={() => openModal(student)}
                                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4 inline" />
                                            </button>
                                        )}
                                        {user?.role === 'ROLE_ADMIN' && (
                                            <button 
                                                onClick={() => handleDelete(student.id)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 inline" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white">
                            <h3 className="text-xl font-bold text-gray-900">
                                {isEdit ? 'Edit Student' : 'Add New Student'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link User Account (Optional)</label>
                                    <select name="userId" value={formData.userId} onChange={handleInputChange} disabled={isEdit} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-500">
                                        <option value="">-- No Account --</option>
                                        {unassignedUsers.map(u => (
                                            <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Date</label>
                                    <input type="date" name="enrollmentDate" value={formData.enrollmentDate} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"></textarea>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors">
                                    {isEdit ? 'Update Student' : 'Save Student'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;
