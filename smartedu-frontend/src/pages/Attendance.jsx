import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Calendar, CheckCircle, XCircle, Clock, Plus, Edit2, Trash2, X, Search, Download, Filter, CalendarCheck } from 'lucide-react';

const statusBadge = (status) => {
    if (status === 'PRESENT') return <span className="badge badge-emerald"><CheckCircle className="w-3 h-3 mr-1" />Present</span>;
    if (status === 'ABSENT')  return <span className="badge badge-rose"><XCircle className="w-3 h-3 mr-1" />Absent</span>;
    if (status === 'LATE')    return <span className="badge badge-amber"><Clock className="w-3 h-3 mr-1" />Late</span>;
    return <span className="badge badge-slate">{status}</span>;
};

const approvalBadge = (s) => {
    if (s === 'APPROVED') return <span className="badge badge-emerald">Approved</span>;
    if (s === 'REJECTED') return <span className="badge badge-rose">Rejected</span>;
    return <span className="badge badge-amber">Pending</span>;
};

const Attendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const rawRole = (user?.role || '').toUpperCase().replace(/^ROLE_/, '');

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({ id: null, studentId: '', date: '', status: 'PRESENT' });

    const fetchAttendance = async () => {
        try {
            let res;
            if (rawRole === 'STUDENT') {
                try {
                    const me = await api.get('/students/me');
                    res = await api.get(`/attendance/student/${me.data.id}`);
                } catch { setAttendance([]); setLoading(false); return; }
            } else {
                res = await api.get('/attendance');
            }
            setAttendance(res?.data || []);
        } catch { toast.error('Failed to fetch attendance'); }
        finally { setLoading(false); }
    };

    const fetchStudents = async () => {
        try { const res = await api.get('/students'); setStudents(res.data || []); }
        catch { /* silent */ }
    };

    useEffect(() => {
        fetchAttendance();
        if (rawRole === 'ADMIN' || rawRole === 'TEACHER') fetchStudents();
    }, [user, rawRole]);

    const openModal = (record = null) => {
        if (record) {
            setIsEdit(true);
            setFormData({ id: record.id, studentId: record.student?.id || record.studentId || '', date: record.date || '', status: record.status || 'PRESENT' });
        } else {
            setIsEdit(false);
            setFormData({ id: null, studentId: students[0]?.id || '', date: new Date().toISOString().split('T')[0], status: 'PRESENT' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.studentId) { toast.error('Please select a student'); return; }
        try {
            const payload = { date: formData.date, status: formData.status, student: { id: formData.studentId } };
            if (isEdit) {
                await api.put(`/attendance/${formData.id}`, payload);
                toast.success('Attendance updated');
            } else {
                await api.post('/attendance', payload);
                toast.success('Attendance recorded');
            }
            fetchAttendance();
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this attendance record?')) return;
        try { await api.delete(`/attendance/${id}`); toast.success('Record deleted'); fetchAttendance(); }
        catch { toast.error('Failed to delete'); }
    };

    const exportToCSV = () => {
        if (filteredAttendance.length === 0) { toast.error('No records to export'); return; }
        const headers = ['ID', 'Date', 'Student ID', 'Student Name', 'Status', 'Approval'];
        const rows = filteredAttendance.map(a => {
            const name = a.student ? `${a.student.firstName} ${a.student.lastName}` : `#${a.studentId}`;
            return [a.id, a.date||'', a.student?.id||'', `"${name}"`, a.status||'', a.approvalStatus||'APPROVED'].join(',');
        });
        const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
        const link = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(blob),
            download: `SmartEdu_Attendance_${new Date().toISOString().split('T')[0]}.csv`
        });
        link.click();
        toast.success('Exported to CSV');
    };

    const filteredAttendance = attendance.filter(r => {
        const q = searchTerm.toLowerCase();
        const name = r.student ? `${r.student.firstName} ${r.student.lastName}`.toLowerCase() : '';
        return (name.includes(q) || (r.date && r.date.includes(q))) &&
               (statusFilter === 'ALL' || r.status === statusFilter);
    });

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-slate-500">Loading attendance records...</p>
            </div>
        </div>
    );

    return (
        <>
            <div className="animate-fade-in-up">
            <div className="section-card">
                {/* Header */}
                <div className="section-card-header">
                    <div>
                        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                            <CalendarCheck className="w-4 h-4 text-indigo-500" />
                            Attendance Log
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">{attendance.length} record{attendance.length !== 1 ? 's' : ''} total</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={exportToCSV} className="btn-secondary gap-2">
                            <Download className="w-3.5 h-3.5" /> Export CSV
                        </button>
                        {(rawRole === 'ADMIN' || rawRole === 'TEACHER') && (
                            <button onClick={() => openModal()} className="btn-primary gap-2">
                                <Plus className="w-3.5 h-3.5" /> Mark Attendance
                            </button>
                        )}
                    </div>
                </div>

                {/* Search + Filter */}
                <div className="px-5 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name or date…"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 glass-input rounded-xl text-sm focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Filter className="w-3.5 h-3.5" />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="glass-input px-3 py-2 rounded-xl text-sm focus:outline-none"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PRESENT">Present</option>
                            <option value="ABSENT">Absent</option>
                            <option value="LATE">Late</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {filteredAttendance.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                            <Calendar className="w-12 h-12 mb-3" />
                            <p className="text-sm font-medium text-slate-400">No attendance records found</p>
                            {(rawRole === 'ADMIN' || rawRole === 'TEACHER') && (
                                <button onClick={() => openModal()} className="btn-primary mt-4">
                                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Mark First Attendance
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                    <th className="px-5 py-3.5">Date</th>
                                    <th className="px-5 py-3.5">Student</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    {(rawRole === 'ADMIN' || rawRole === 'TEACHER') && (
                                        <>
                                            <th className="px-5 py-3.5">Approval</th>
                                            <th className="px-5 py-3.5 text-right">Actions</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredAttendance.map(record => (
                                    <tr key={record.id} className="table-row-hover">
                                        <td className="px-5 py-3.5">
                                            <span className="text-sm font-semibold text-slate-800">{record.date}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                    {record.student?.firstName?.charAt(0) || '?'}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">
                                                    {record.student
                                                        ? `${record.student.firstName} ${record.student.lastName}`
                                                        : `Student #${record.studentId}`}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">{statusBadge(record.status)}</td>
                                        {(rawRole === 'ADMIN' || rawRole === 'TEACHER') && (
                                            <>
                                                <td className="px-5 py-3.5">{approvalBadge(record.approvalStatus)}</td>
                                                <td className="px-5 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => openModal(record)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition" title="Edit">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(record.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition" title="Delete">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
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
                    <div className="modal-box" style={{ maxWidth: '460px' }}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900">
                                    {isEdit ? 'Edit Attendance' : 'Mark Attendance'}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {isEdit ? 'Update the attendance record' : 'Record student attendance'}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Student <span className="text-rose-500">*</span></label>
                                    <select
                                        value={formData.studentId}
                                        onChange={e => setFormData({...formData, studentId: e.target.value})}
                                        required
                                        className="w-full px-3 py-2.5 glass-input rounded-xl"
                                    >
                                        <option value="" disabled>— Select Student —</option>
                                        {students.map(s => (
                                            <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date <span className="text-rose-500">*</span></label>
                                    <input
                                        type="date" required
                                        value={formData.date}
                                        onChange={e => setFormData({...formData, date: e.target.value})}
                                        className="w-full px-3 py-2.5 glass-input rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status <span className="text-rose-500">*</span></label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['PRESENT', 'ABSENT', 'LATE'].map(s => (
                                            <button
                                                key={s} type="button"
                                                onClick={() => setFormData({...formData, status: s})}
                                                className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                                                    formData.status === s
                                                        ? s === 'PRESENT' ? 'bg-emerald-500 text-white border-emerald-500'
                                                          : s === 'ABSENT' ? 'bg-rose-500 text-white border-rose-500'
                                                          : 'bg-amber-500 text-white border-amber-500'
                                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                                }`}
                                            >
                                                {s === 'PRESENT' ? '✓ Present' : s === 'ABSENT' ? '✗ Absent' : '⏱ Late'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-[20px]">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">{isEdit ? 'Update' : 'Save Attendance'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Attendance;
