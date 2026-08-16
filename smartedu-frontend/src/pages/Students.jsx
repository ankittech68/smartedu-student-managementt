import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Search, Plus, Edit2, Trash2, X, Download, UserCheck, Users } from 'lucide-react';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const rawRole = (user?.role || '').toUpperCase().replace(/^ROLE_/, '');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        id: null, firstName: '', lastName: '',
        dateOfBirth: '', enrollmentDate: '',
        phone: '', address: '', userId: ''
    });

    const [unassignedUsers, setUnassignedUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchStudents = async () => {
        try {
            const res = await api.get('/students');
            setStudents(res.data || []);
        } catch { toast.error('Failed to fetch students'); }
        finally { setLoading(false); }
    };

    const fetchUnassignedUsers = async () => {
        try {
            const res = await api.get('/users/students/unassigned');
            setUnassignedUsers(res.data || []);
        } catch { /* silent */ }
    };

    useEffect(() => {
        fetchStudents();
        if (rawRole === 'ADMIN' || rawRole === 'TEACHER') fetchUnassignedUsers();
    }, [user, rawRole]);

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
                id: null, firstName: '', lastName: '',
                dateOfBirth: '',
                enrollmentDate: new Date().toISOString().split('T')[0],
                phone: '', address: '', userId: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (payload.userId) payload.user = { id: payload.userId };
            delete payload.userId;

            if (isEdit) {
                await api.put(`/students/${formData.id}`, payload);
                toast.success('Student updated successfully');
            } else {
                await api.post('/students', payload);
                toast.success('Student added successfully');
            }
            fetchStudents();
            if (rawRole === 'ADMIN' || rawRole === 'TEACHER') fetchUnassignedUsers();
            setIsModalOpen(false);
        } catch (error) {
            const msg = error.response?.data?.message || (isEdit ? 'Failed to update' : 'Failed to add student');
            toast.error(msg);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student record?')) return;
        try {
            await api.delete(`/students/${id}`);
            toast.success('Student deleted');
            fetchStudents();
        } catch { toast.error('Failed to delete student'); }
    };

    const exportToCSV = () => {
        if (filteredStudents.length === 0) { toast.error('No records to export'); return; }
        const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Enrollment Date', 'Address'];
        const rows = filteredStudents.map(s => [
            s.id, `"${s.firstName||''}"`, `"${s.lastName||''}"`,
            `"${s.email||''}"`, `"${s.phone||''}"`,
            s.enrollmentDate||'', `"${s.address||''}"`
        ].join(','));
        const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
        const a = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(blob),
            download: `SmartEdu_Students_${new Date().toISOString().split('T')[0]}.csv`
        });
        a.click();
        toast.success('CSV exported!');
    };

    const filteredStudents = students.filter(s => {
        const q = searchTerm.toLowerCase();
        return `${s.firstName} ${s.lastName}`.toLowerCase().includes(q)
            || s.id.toString().includes(q)
            || (s.email && s.email.toLowerCase().includes(q));
    });

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-slate-500">Loading students...</p>
            </div>
        </div>
    );

    return (
        <>
            <div className="animate-fade-in-up space-y-0">
            <div className="section-card">
                {/* Header */}
                <div className="section-card-header">
                    <div>
                        <h2 className="text-base font-extrabold text-slate-900">Students</h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {students.length} student{students.length !== 1 ? 's' : ''} registered
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={exportToCSV} className="btn-secondary gap-2">
                            <Download className="w-3.5 h-3.5" /> Export CSV
                        </button>
                        {(rawRole === 'ADMIN' || rawRole === 'TEACHER') && (
                            <button onClick={() => openModal()} className="btn-primary gap-2">
                                <Plus className="w-3.5 h-3.5" /> Add Student
                            </button>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="px-5 py-3 border-b border-slate-100 bg-white">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name, ID, or email…"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 glass-input rounded-xl text-sm focus:outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {filteredStudents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                            <Users className="w-12 h-12 mb-3" />
                            <p className="text-sm font-medium text-slate-400">
                                {searchTerm ? `No students matching "${searchTerm}"` : 'No students yet'}
                            </p>
                            {!searchTerm && (rawRole === 'ADMIN' || rawRole === 'TEACHER') && (
                                <button onClick={() => openModal()} className="btn-primary mt-4">
                                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Add First Student
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                    <th className="px-5 py-3.5">Student</th>
                                    <th className="px-5 py-3.5">ID</th>
                                    <th className="px-5 py-3.5">Account</th>
                                    <th className="px-5 py-3.5">Enrolled</th>
                                    {(rawRole === 'ADMIN' || rawRole === 'TEACHER') && (
                                        <th className="px-5 py-3.5 text-right">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredStudents.map(student => (
                                    <tr key={student.id} className="table-row-hover">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
                                                    {student.firstName?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {student.firstName} {student.lastName}
                                                    </p>
                                                    {student.email && (
                                                        <p className="text-xs text-slate-400">{student.email}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">#{student.id}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {student.userId ? (
                                                <span className="badge badge-emerald">
                                                    <UserCheck className="w-3 h-3 mr-1" />
                                                    {student.username || `User #${student.userId}`}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Unlinked</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-sm text-slate-600">{student.enrollmentDate || '—'}</span>
                                        </td>
                                        {(rawRole === 'ADMIN' || rawRole === 'TEACHER') && (
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openModal(student)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                        title="Edit Student"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    {rawRole === 'ADMIN' && (
                                                        <button
                                                            onClick={() => handleDelete(student.id)}
                                                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                                                            title="Delete Student"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
                    <div className="modal-box">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900">
                                    {isEdit ? 'Edit Student' : 'Add New Student'}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {isEdit ? 'Update student profile details' : 'Fill in the student information below'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">First Name <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text" name="firstName" required
                                            value={formData.firstName}
                                            onChange={e => setFormData({...formData, firstName: e.target.value})}
                                            className="w-full px-3 py-2.5 glass-input rounded-xl"
                                            placeholder="Enter first name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Last Name <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text" name="lastName" required
                                            value={formData.lastName}
                                            onChange={e => setFormData({...formData, lastName: e.target.value})}
                                            className="w-full px-3 py-2.5 glass-input rounded-xl"
                                            placeholder="Enter last name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Link User Account <span className="text-slate-400">(optional)</span></label>
                                        <select
                                            name="userId"
                                            value={formData.userId}
                                            onChange={e => setFormData({...formData, userId: e.target.value})}
                                            disabled={isEdit}
                                            className="w-full px-3 py-2.5 glass-input rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <option value="">— No Account —</option>
                                            {unassignedUsers.map(u => (
                                                <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date of Birth</label>
                                        <input
                                            type="date" name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                                            className="w-full px-3 py-2.5 glass-input rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Enrollment Date <span className="text-rose-500">*</span></label>
                                        <input
                                            type="date" name="enrollmentDate" required
                                            value={formData.enrollmentDate}
                                            onChange={e => setFormData({...formData, enrollmentDate: e.target.value})}
                                            className="w-full px-3 py-2.5 glass-input rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label>
                                        <input
                                            type="tel" name="phone"
                                            value={formData.phone}
                                            onChange={e => setFormData({...formData, phone: e.target.value})}
                                            className="w-full px-3 py-2.5 glass-input rounded-xl"
                                            placeholder="+91 00000 00000"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Address</label>
                                        <textarea
                                            name="address" rows="2"
                                            value={formData.address}
                                            onChange={e => setFormData({...formData, address: e.target.value})}
                                            className="w-full px-3 py-2.5 glass-input rounded-xl resize-none"
                                            placeholder="Street, City, State…"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-[20px]">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {isEdit ? 'Update Student' : 'Save Student'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Students;
