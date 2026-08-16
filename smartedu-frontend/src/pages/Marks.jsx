import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { BookOpen, Award, Plus, Edit2, Trash2, X, Search, Download, Printer, GraduationCap, CheckCircle, Filter } from 'lucide-react';

const calcGrade = (obtained, total) => {
    if (!obtained || !total || total === 0) return '';
    const p = (obtained / total) * 100;
    if (p >= 90) return 'O';
    if (p >= 80) return 'A+';
    if (p >= 70) return 'A';
    if (p >= 60) return 'B+';
    if (p >= 50) return 'B';
    if (p >= 40) return 'C';
    if (p >= 33) return 'D';
    return 'F';
};

const gradeBadge = (grade) => {
    if (!grade) return null;
    const cls =
        grade === 'O'              ? 'badge badge-purple' :
        grade === 'A+' || grade === 'A' ? 'badge badge-emerald' :
        grade === 'B+' || grade === 'B' ? 'badge badge-indigo' :
        grade === 'C'  || grade === 'D' ? 'badge badge-amber' :
        grade === 'F'              ? 'badge badge-rose' :
                                     'badge badge-slate';
    return <span className={cls}><Award className="w-3 h-3 mr-1" />{grade}</span>;
};

const approvalBadge = (s) => {
    if (s === 'APPROVED') return <span className="badge badge-emerald">Approved</span>;
    if (s === 'REJECTED') return <span className="badge badge-rose">Rejected</span>;
    return <span className="badge badge-amber">Pending</span>;
};

const Marks = () => {
    const [marks, setMarks] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const rawRole = (user?.role || '').toUpperCase().replace(/^ROLE_/, '');

    const [searchTerm, setSearchTerm] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('ALL');
    const [selectedReport, setSelectedReport] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({
        id: null, studentId: '', subject: '',
        marksObtained: '', totalMarks: '100', grade: ''
    });

    const fetchMarks = async () => {
        try {
            let res;
            if (rawRole === 'STUDENT') {
                try {
                    const me = await api.get('/students/me');
                    res = await api.get(`/marks/student/${me.data.id}`);
                } catch { setMarks([]); setLoading(false); return; }
            } else {
                res = await api.get('/marks');
            }
            setMarks(res?.data || []);
        } catch { toast.error('Failed to fetch marks'); }
        finally { setLoading(false); }
    };

    const fetchStudents = async () => {
        try { const res = await api.get('/students'); setStudents(res.data || []); }
        catch { /* silent */ }
    };

    useEffect(() => {
        fetchMarks();
        if (rawRole === 'ADMIN' || rawRole === 'TEACHER') fetchStudents();
    }, [user, rawRole]);

    // Auto-calc grade
    useEffect(() => {
        const g = calcGrade(parseFloat(formData.marksObtained), parseFloat(formData.totalMarks));
        if (g && g !== formData.grade) setFormData(prev => ({ ...prev, grade: g }));
    }, [formData.marksObtained, formData.totalMarks]);

    const openModal = (record = null) => {
        if (record) {
            setIsEdit(true);
            setFormData({
                id: record.id,
                studentId: record.student?.id || record.studentId || '',
                subject: record.subject || '',
                marksObtained: record.marksObtained || '',
                totalMarks: record.totalMarks || '100',
                grade: record.grade || ''
            });
        } else {
            setIsEdit(false);
            setFormData({ id: null, studentId: students[0]?.id || '', subject: '', marksObtained: '', totalMarks: '100', grade: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.studentId) { toast.error('Please select a student'); return; }
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
                toast.success('Marks updated');
            } else {
                await api.post('/marks', payload);
                toast.success('Marks added');
            }
            fetchMarks();
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this marks record?')) return;
        try { await api.delete(`/marks/${id}`); toast.success('Record deleted'); fetchMarks(); }
        catch { toast.error('Failed to delete'); }
    };

    const exportToCSV = () => {
        if (filteredMarks.length === 0) { toast.error('No records to export'); return; }
        const headers = ['ID', 'Subject', 'Student ID', 'Student Name', 'Marks', 'Total', 'Grade', 'Approval'];
        const rows = filteredMarks.map(m => {
            const name = m.student ? `${m.student.firstName} ${m.student.lastName}` : `#${m.studentId}`;
            return [m.id, `"${m.subject||''}"`, m.student?.id||'', `"${name}"`,
                    m.marksObtained, m.totalMarks, m.grade||'', m.approvalStatus||''].join(',');
        });
        const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
        const a = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(blob),
            download: `SmartEdu_Marks_${new Date().toISOString().split('T')[0]}.csv`
        });
        a.click();
        toast.success('Exported to CSV');
    };

    const subjectsList = [...new Set(marks.map(m => m.subject).filter(Boolean))];

    const filteredMarks = marks.filter(r => {
        const q = searchTerm.toLowerCase();
        const name = r.student ? `${r.student.firstName} ${r.student.lastName}`.toLowerCase() : '';
        return (name.includes(q) || (r.subject||'').toLowerCase().includes(q) || (r.grade||'').toLowerCase().includes(q))
            && (subjectFilter === 'ALL' || r.subject === subjectFilter);
    });

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-slate-500">Loading marks & grades...</p>
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
                            <BookOpen className="w-4 h-4 text-indigo-500" />
                            Marks & Report Cards
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">{marks.length} record{marks.length !== 1 ? 's' : ''} total</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedReport({ student: marks[0]?.student || null, records: filteredMarks })}
                            className="btn-secondary gap-2"
                        >
                            <Printer className="w-3.5 h-3.5" /> Marksheet
                        </button>
                        <button onClick={exportToCSV} className="btn-secondary gap-2">
                            <Download className="w-3.5 h-3.5" /> Export CSV
                        </button>
                        {(rawRole === 'ADMIN' || rawRole === 'TEACHER') && (
                            <button onClick={() => openModal()} className="btn-primary gap-2">
                                <Plus className="w-3.5 h-3.5" /> Add Marks
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
                            placeholder="Search by student, subject, or grade…"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 glass-input rounded-xl text-sm focus:outline-none"
                        />
                    </div>
                    {subjectsList.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Filter className="w-3.5 h-3.5 text-slate-400" />
                            <select
                                value={subjectFilter}
                                onChange={e => setSubjectFilter(e.target.value)}
                                className="glass-input px-3 py-2 rounded-xl text-sm focus:outline-none"
                            >
                                <option value="ALL">All Subjects ({subjectsList.length})</option>
                                {subjectsList.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                            </select>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {filteredMarks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                            <BookOpen className="w-12 h-12 mb-3" />
                            <p className="text-sm font-medium text-slate-400">
                                {searchTerm || subjectFilter !== 'ALL' ? 'No marks matching filters' : 'No marks records yet'}
                            </p>
                            {(rawRole === 'ADMIN' || rawRole === 'TEACHER') && !searchTerm && (
                                <button onClick={() => openModal()} className="btn-primary mt-4">
                                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Add First Record
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                    <th className="px-5 py-3.5">Subject</th>
                                    <th className="px-5 py-3.5">Student</th>
                                    <th className="px-5 py-3.5">Score</th>
                                    <th className="px-5 py-3.5">Grade</th>
                                    {(rawRole === 'ADMIN' || rawRole === 'TEACHER') && (
                                        <>
                                            <th className="px-5 py-3.5">Approval</th>
                                            <th className="px-5 py-3.5 text-right">Actions</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredMarks.map(record => {
                                    const pct = record.totalMarks ? Math.round((record.marksObtained / record.totalMarks) * 100) : 0;
                                    return (
                                        <tr key={record.id} className="table-row-hover">
                                            <td className="px-5 py-3.5">
                                                <span className="text-sm font-semibold text-slate-900">{record.subject}</span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                        {record.student?.firstName?.charAt(0) || '?'}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {record.student ? `${record.student.firstName} ${record.student.lastName}` : `#${record.studentId}`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div>
                                                    <span className="text-sm font-bold text-slate-900">{record.marksObtained}</span>
                                                    <span className="text-xs text-slate-400"> / {record.totalMarks}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-20">
                                                        <div
                                                            className={`h-1.5 rounded-full transition-all ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-indigo-500' : 'bg-rose-500'}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[11px] text-slate-400">{pct}%</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">{gradeBadge(record.grade)}</td>
                                            {(rawRole === 'ADMIN' || rawRole === 'TEACHER') && (
                                                <>
                                                    <td className="px-5 py-3.5">{approvalBadge(record.approvalStatus)}</td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button onClick={() => openModal(record)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition">
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(record.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>

        {/* Printable Marksheet Modal */}
            {selectedReport && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedReport(null)}>
                    <div className="modal-box" style={{ maxWidth: '720px' }}>
                        <div className="no-print flex items-center justify-between px-6 py-3 bg-slate-900 text-white shrink-0 rounded-t-[20px]">
                            <div className="flex items-center gap-2">
                                <Printer className="w-4 h-4 text-indigo-400" />
                                <span className="text-sm font-bold">Marksheet Preview</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => window.print()} className="btn-primary text-xs py-1.5 px-3">
                                    Print / Save PDF
                                </button>
                                <button onClick={() => setSelectedReport(null)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div id="printable-report-card" className="p-8 overflow-y-auto flex-1 space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b-2 border-indigo-600 pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center">
                                        <GraduationCap className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-black text-slate-900">SmartEdu Portal</h1>
                                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Official Academic Grade Sheet</p>
                                    </div>
                                </div>
                                <div className="text-right text-xs text-slate-500">
                                    <p className="font-bold text-slate-800 text-sm">Date Issued</p>
                                    <p>{new Date().toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Student Info */}
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Student Name</p>
                                    <p className="font-bold text-slate-900 text-base mt-1">
                                        {selectedReport.student ? `${selectedReport.student.firstName} ${selectedReport.student.lastName}` : 'Academic Student'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Student ID</p>
                                    <p className="font-bold text-slate-900 text-base mt-1">#{selectedReport.student?.id || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Marks Table */}
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="bg-slate-100 text-slate-600 font-bold text-[11px] uppercase tracking-wider border-b border-slate-300">
                                        <th className="py-3 px-4">Subject</th>
                                        <th className="py-3 px-4">Marks Obtained</th>
                                        <th className="py-3 px-4">Total</th>
                                        <th className="py-3 px-4">%</th>
                                        <th className="py-3 px-4 text-right">Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {selectedReport.records.map(r => (
                                        <tr key={r.id}>
                                            <td className="py-3 px-4 font-semibold text-slate-900">{r.subject}</td>
                                            <td className="py-3 px-4 font-medium">{r.marksObtained}</td>
                                            <td className="py-3 px-4 text-slate-500">{r.totalMarks}</td>
                                            <td className="py-3 px-4 font-semibold text-indigo-700">
                                                {Math.round((r.marksObtained / r.totalMarks) * 100)}%
                                            </td>
                                            <td className="py-3 px-4 text-right font-black text-slate-900">{r.grade}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Footer */}
                            <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                                <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Verified Academic Record</span>
                                </div>
                                <p className="italic">SmartEdu Student Management System</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
                    <div className="modal-box" style={{ maxWidth: '480px' }}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900">{isEdit ? 'Edit Marks' : 'Add Marks'}</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {isEdit ? 'Update the marks record' : 'Enter subject marks and grade'}
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
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subject <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text" required
                                        value={formData.subject}
                                        onChange={e => setFormData({...formData, subject: e.target.value})}
                                        className="w-full px-3 py-2.5 glass-input rounded-xl"
                                        placeholder="e.g. Data Structures & Algorithms"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Marks Obtained <span className="text-rose-500">*</span></label>
                                        <input
                                            type="number" step="0.01" required
                                            value={formData.marksObtained}
                                            onChange={e => setFormData({...formData, marksObtained: e.target.value})}
                                            className="w-full px-3 py-2.5 glass-input rounded-xl"
                                            placeholder="85"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Total Marks <span className="text-rose-500">*</span></label>
                                        <input
                                            type="number" step="0.01" required
                                            value={formData.totalMarks}
                                            onChange={e => setFormData({...formData, totalMarks: e.target.value})}
                                            className="w-full px-3 py-2.5 glass-input rounded-xl"
                                            placeholder="100"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Calculated Grade</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text" required maxLength="5"
                                            value={formData.grade}
                                            onChange={e => setFormData({...formData, grade: e.target.value})}
                                            className="w-24 px-3 py-2.5 glass-input rounded-xl font-bold text-indigo-600 text-center"
                                        />
                                        <span className="text-xs text-slate-400">Auto-calculated from marks above</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-[20px]">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">{isEdit ? 'Update Marks' : 'Save Marks'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Marks;
