import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, CheckSquare, AlertCircle, CheckCheck, Trash2 } from 'lucide-react';

const Approvals = () => {
    const { user } = useContext(AuthContext);
    const rawRole = (user?.role || '').toUpperCase().replace(/^ROLE_/, '');
    const [pendingData, setPendingData] = useState({ attendance: [], marks: [] });
    const [loading, setLoading] = useState(true);
    const [processingBulk, setProcessingBulk] = useState(false);

    const fetchPending = async () => {
        try {
            const res = await api.get('/approvals/pending');
            setPendingData(res.data || { attendance: [], marks: [] });
        } catch {
            toast.error('Failed to load pending requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (rawRole === 'ADMIN') fetchPending(); }, [user, rawRole]);

    const handleAction = async (type, id, action) => {
        try {
            await api.put(`/${type}/${id}/${action}`);
            toast.success(`Request ${action}d successfully`);
            fetchPending();
        } catch {
            toast.error(`Failed to ${action} request`);
        }
    };

    const handleApproveAll = async () => {
        if (!window.confirm('Are you sure you want to APPROVE ALL pending attendance and marks requests?')) return;
        setProcessingBulk(true);
        try {
            await api.put('/approvals/approve-all');
            toast.success('All pending requests have been APPROVED!');
            fetchPending();
        } catch {
            toast.error('Failed to approve all requests');
        } finally {
            setProcessingBulk(false);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm('Are you sure you want to REJECT & CLEAR ALL pending requests?')) return;
        setProcessingBulk(true);
        try {
            await api.put('/approvals/reject-all');
            toast.success('All pending requests have been CLEARED!');
            fetchPending();
        } catch {
            toast.error('Failed to clear all requests');
        } finally {
            setProcessingBulk(false);
        }
    };

    if (rawRole !== 'ADMIN') return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
                <p className="font-bold text-slate-700">Access Denied</p>
                <p className="text-sm text-slate-400 mt-1">This page is restricted to Administrators only.</p>
            </div>
        </div>
    );

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-slate-500">Loading approvals...</p>
            </div>
        </div>
    );

    const noPending = !pendingData.attendance?.length && !pendingData.marks?.length;
    const totalPending = (pendingData.attendance?.length || 0) + (pendingData.marks?.length || 0);

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="page-title flex items-center gap-2">
                            <CheckSquare className="w-6 h-6 text-indigo-500" />
                            Pending <span className="gradient-text">Approvals</span>
                        </h1>
                        {totalPending > 0 && (
                            <span className="badge badge-amber">{totalPending} pending</span>
                        )}
                    </div>
                    <p className="page-subtitle">Review faculty-submitted attendance & marks records</p>
                </div>

                {/* Bulk Action Buttons */}
                {totalPending > 0 && (
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleApproveAll}
                            disabled={processingBulk}
                            className="btn-primary gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/20"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Approve All ({totalPending})
                        </button>
                        <button
                            onClick={handleClearAll}
                            disabled={processingBulk}
                            className="btn-danger gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear All
                        </button>
                    </div>
                )}
            </div>

            {noPending ? (
                <div className="section-card p-16 text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">All Clear!</h3>
                    <p className="text-sm text-slate-400 mt-1">No pending requests at this time.</p>
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 gap-5">
                    {/* Attendance Approvals */}
                    {pendingData.attendance?.length > 0 && (
                        <div className="section-card overflow-hidden">
                            <div className="section-card-header" style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a' }}>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                    <h3 className="text-sm font-bold text-amber-900">
                                        Attendance Requests
                                        <span className="ml-2 badge badge-amber">{pendingData.attendance.length}</span>
                                    </h3>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {pendingData.attendance.map(record => (
                                    <div key={record.id} className="px-5 py-4 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {record.student?.firstName?.charAt(0) || '?'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 truncate">
                                                    {record.student ? `${record.student.firstName} ${record.student.lastName}` : `Student #${record.studentId}`}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {record.date} · <span className="font-semibold text-amber-600">{record.status}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={() => handleAction('attendance', record.id, 'approve')}
                                                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition border border-emerald-200"
                                                title="Approve"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleAction('attendance', record.id, 'reject')}
                                                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition border border-rose-200"
                                                title="Reject"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Marks Approvals */}
                    {pendingData.marks?.length > 0 && (
                        <div className="section-card overflow-hidden">
                            <div className="section-card-header" style={{ background: '#eef2ff', borderBottom: '1px solid #c7d2fe' }}>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-indigo-600" />
                                    <h3 className="text-sm font-bold text-indigo-900">
                                        Marks Requests
                                        <span className="ml-2 badge badge-indigo">{pendingData.marks.length}</span>
                                    </h3>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {pendingData.marks.map(record => (
                                    <div key={record.id} className="px-5 py-4 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {record.student?.firstName?.charAt(0) || '?'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 truncate">
                                                    {record.student ? `${record.student.firstName} ${record.student.lastName}` : `Student #${record.studentId}`}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {record.subject} · <span className="font-semibold text-indigo-600">{record.marksObtained}/{record.totalMarks}</span>
                                                    {record.grade && ` · Grade: ${record.grade}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={() => handleAction('marks', record.id, 'approve')}
                                                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition border border-emerald-200"
                                                title="Approve"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleAction('marks', record.id, 'reject')}
                                                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition border border-rose-200"
                                                title="Reject"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Approvals;
