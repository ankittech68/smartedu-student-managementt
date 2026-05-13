import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Calendar, CheckCircle, XCircle, Clock, Plus, Edit2, Trash2, X } from 'lucide-react';

const Attendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        studentId: '',
        date: '',
        status: 'PRESENT'
    });

    const fetchAttendance = async () => {
        try {
            let response;
            if (user?.role === 'ROLE_STUDENT') {
                try {
                    const studentProfile = await api.get(`/students/me`);
                    response = await api.get(`/attendance/student/${studentProfile.data.id}`);
                } catch (e) {
                    setAttendance([]);
                    setLoading(false);
                    return;
                }
            } else {
                response = await api.get('/attendance');
            }
            setAttendance(response?.data || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch attendance records');
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await api.get('/students');
            setStudents(response.data);
        } catch (error) {
            console.error('Failed to load students for dropdown', error);
        }
    };

    useEffect(() => {
        fetchAttendance();
        if (user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') {
            fetchStudents();
        }
    }, [user]);

    const openModal = (record = null) => {
        if (record) {
            setIsEdit(true);
            setFormData({
                id: record.id,
                studentId: record.student?.id || '',
                date: record.date || '',
                status: record.status || 'PRESENT'
            });
        } else {
            setIsEdit(false);
            setFormData({
                id: null,
                studentId: '',
                date: new Date().toISOString().split('T')[0],
                status: 'PRESENT'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                date: formData.date,
                status: formData.status,
                student: { id: formData.studentId }
            };

            if (isEdit) {
                await api.put(`/attendance/${formData.id}`, payload);
                toast.success('Attendance updated successfully');
            } else {
                await api.post('/attendance', payload);
                toast.success('Attendance marked successfully');
            }
            fetchAttendance();
            closeModal();
        } catch (error) {
            console.error(error);
            toast.error(isEdit ? 'Failed to update attendance' : 'Failed to mark attendance');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this attendance record?')) {
            try {
                await api.delete(`/attendance/${id}`);
                toast.success('Attendance deleted successfully');
                fetchAttendance();
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete attendance');
            }
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PRESENT':
                return <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold flex items-center w-fit"><CheckCircle className="w-3 h-3 mr-1"/> Present</span>;
            case 'ABSENT':
                return <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold flex items-center w-fit"><XCircle className="w-3 h-3 mr-1"/> Absent</span>;
            case 'LATE':
                return <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold flex items-center w-fit"><Clock className="w-3 h-3 mr-1"/> Late</span>;
            default:
                return status;
        }
    };

    if (loading) return <div className="p-8 text-center">Loading attendance...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary-600" /> Attendance Records
                </h2>
                {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
                    <button 
                        onClick={() => openModal()}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Mark Attendance
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider border-b border-gray-200">
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold">Student Name</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
                                <th className="px-6 py-4 font-semibold">Approval Status</th>
                            )}
                            {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {attendance.length === 0 ? (
                            <tr>
                                <td colSpan={user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER' ? "4" : "3"} className="px-6 py-8 text-center text-gray-500">
                                    No attendance records found.
                                </td>
                            </tr>
                        ) : (
                            attendance.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-900 font-medium">{record.date}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {record.student ? `${record.student.firstName} ${record.student.lastName}` : `ID: #${record.studentId || 'N/A'}`}
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                                    {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                                record.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                record.approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {record.approvalStatus || 'APPROVED'}
                                            </span>
                                        </td>
                                    )}
                                    {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button 
                                                onClick={() => openModal(record)}
                                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4 inline" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(record.id)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white">
                            <h3 className="text-xl font-bold text-gray-900">
                                {isEdit ? 'Edit Attendance' : 'Mark Attendance'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                                <select 
                                    name="studentId" 
                                    value={formData.studentId} 
                                    onChange={handleInputChange} 
                                    required 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="" disabled>Select Student</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.firstName} {s.lastName} (ID: {s.id})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input 
                                    type="date" 
                                    name="date" 
                                    value={formData.date} 
                                    onChange={handleInputChange} 
                                    required 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select 
                                    name="status" 
                                    value={formData.status} 
                                    onChange={handleInputChange} 
                                    required 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="PRESENT">Present</option>
                                    <option value="ABSENT">Absent</option>
                                    <option value="LATE">Late</option>
                                </select>
                            </div>
                            
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors">
                                    {isEdit ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
