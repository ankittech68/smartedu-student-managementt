import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { BookOpen, Award, Plus, Edit2, Trash2, X } from 'lucide-react';

const Marks = () => {
    const [marks, setMarks] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        studentId: '',
        subject: '',
        marksObtained: '',
        totalMarks: '',
        grade: ''
    });

    const fetchMarks = async () => {
        try {
            let response;
            if (user?.role === 'ROLE_STUDENT') {
                try {
                    const studentProfile = await api.get(`/students/me`);
                    response = await api.get(`/marks/student/${studentProfile.data.id}`);
                } catch (e) {
                    setMarks([]);
                    setLoading(false);
                    return;
                }
            } else {
                response = await api.get('/marks');
            }
            setMarks(response?.data || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch marks');
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
        fetchMarks();
        if (user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') {
            fetchStudents();
        }
    }, [user]);

    // Auto-calculate grade in the form when marks change
    useEffect(() => {
        if (formData.marksObtained && formData.totalMarks) {
            const marksObtained = parseFloat(formData.marksObtained);
            const totalMarks = parseFloat(formData.totalMarks);
            if (!isNaN(marksObtained) && !isNaN(totalMarks) && totalMarks > 0) {
                const percentage = (marksObtained / totalMarks) * 100;
                let calculatedGrade = 'F';
                if (percentage >= 90) calculatedGrade = 'O';
                else if (percentage >= 80) calculatedGrade = 'A+';
                else if (percentage >= 70) calculatedGrade = 'A';
                else if (percentage >= 60) calculatedGrade = 'B+';
                else if (percentage >= 50) calculatedGrade = 'B';
                else if (percentage >= 40) calculatedGrade = 'C';
                else if (percentage >= 33) calculatedGrade = 'D';

                if (formData.grade !== calculatedGrade) {
                    setFormData(prev => ({ ...prev, grade: calculatedGrade }));
                }
            }
        }
    }, [formData.marksObtained, formData.totalMarks]);

    const openModal = (record = null) => {
        if (record) {
            setIsEdit(true);
            setFormData({
                id: record.id,
                studentId: record.student?.id || '',
                subject: record.subject || '',
                marksObtained: record.marksObtained || '',
                totalMarks: record.totalMarks || '',
                grade: record.grade || ''
            });
        } else {
            setIsEdit(false);
            setFormData({
                id: null,
                studentId: '',
                subject: '',
                marksObtained: '',
                totalMarks: '',
                grade: ''
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
                subject: formData.subject,
                marksObtained: parseFloat(formData.marksObtained),
                totalMarks: parseFloat(formData.totalMarks),
                grade: formData.grade,
                student: { id: formData.studentId }
            };

            if (isEdit) {
                await api.put(`/marks/${formData.id}`, payload);
                toast.success('Marks updated successfully');
            } else {
                await api.post('/marks', payload);
                toast.success('Marks added successfully');
            }
            fetchMarks();
            closeModal();
        } catch (error) {
            console.error(error);
            toast.error(isEdit ? 'Failed to update marks' : 'Failed to add marks');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await api.delete(`/marks/${id}`);
                toast.success('Marks deleted successfully');
                fetchMarks();
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete marks');
            }
        }
    };

    const getGradeColor = (grade) => {
        if (grade?.includes('O')) return 'text-purple-600 bg-purple-50';
        if (grade?.includes('A')) return 'text-green-600 bg-green-50';
        if (grade?.includes('B')) return 'text-blue-600 bg-blue-50';
        if (grade?.includes('C')) return 'text-yellow-600 bg-yellow-50';
        if (grade?.includes('D')) return 'text-orange-600 bg-orange-50';
        return 'text-red-600 bg-red-50';
    };

    if (loading) return <div className="p-8 text-center">Loading marks...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-primary-600" /> Marks & Grades
                </h2>
                {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
                    <button 
                        onClick={() => openModal()}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Marks
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider border-b border-gray-200">
                            <th className="px-6 py-4 font-semibold">Subject</th>
                            <th className="px-6 py-4 font-semibold">Student</th>
                            <th className="px-6 py-4 font-semibold">Score</th>
                            <th className="px-6 py-4 font-semibold">Grade</th>
                            {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
                                <th className="px-6 py-4 font-semibold">Approval Status</th>
                            )}
                            {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {marks.length === 0 ? (
                            <tr>
                                <td colSpan={user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER' ? "5" : "4"} className="px-6 py-8 text-center text-gray-500">
                                    No marks found.
                                </td>
                            </tr>
                        ) : (
                            marks.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{record.subject}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {record.student ? `${record.student.firstName} ${record.student.lastName}` : `ID: #${record.studentId || 'N/A'}`}
                                    </td>
                                    <td className="px-6 py-4 text-gray-900">
                                        {record.marksObtained} / {record.totalMarks}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full font-bold flex items-center w-fit ${getGradeColor(record.grade)}`}>
                                            <Award className="w-4 h-4 mr-1" /> {record.grade}
                                        </span>
                                    </td>
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
                                {isEdit ? 'Edit Marks' : 'Add Marks'}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input 
                                    type="text" 
                                    name="subject" 
                                    value={formData.subject} 
                                    onChange={handleInputChange} 
                                    required 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Marks Obtained</label>
                                    <input 
                                        type="number" 
                                        name="marksObtained" 
                                        step="0.01"
                                        value={formData.marksObtained} 
                                        onChange={handleInputChange} 
                                        required 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                                    <input 
                                        type="number" 
                                        name="totalMarks" 
                                        step="0.01"
                                        value={formData.totalMarks} 
                                        onChange={handleInputChange} 
                                        required 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                                <input 
                                    type="text" 
                                    name="grade" 
                                    value={formData.grade} 
                                    onChange={handleInputChange} 
                                    required 
                                    maxLength="5"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" 
                                />
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

export default Marks;
