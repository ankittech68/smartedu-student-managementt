import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const Approvals = () => {
    const { user } = useContext(AuthContext);
    const [pendingData, setPendingData] = useState({ attendance: [], marks: [] });
    const [loading, setLoading] = useState(true);

    const fetchPendingApprovals = async () => {
        try {
            const response = await api.get('/approvals/pending');
            setPendingData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch pending approvals', error);
            toast.error('Failed to load pending requests');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'ROLE_ADMIN') {
            fetchPendingApprovals();
        }
    }, [user]);

    const handleAction = async (type, id, action) => {
        try {
            await api.put(`/${type}/${id}/${action}`);
            toast.success(`Request ${action}d successfully`);
            fetchPendingApprovals();
        } catch (error) {
            console.error(error);
            toast.error(`Failed to ${action} request`);
        }
    };

    if (user?.role !== 'ROLE_ADMIN') {
        return <div className="p-8 text-center text-red-500 font-medium">Access Denied. Admins only.</div>;
    }

    if (loading) return <div className="p-8 text-center">Loading pending approvals...</div>;

    const noPending = pendingData.attendance.length === 0 && pendingData.marks.length === 0;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Clock className="w-6 h-6 mr-2 text-primary-600" /> Pending Approvals
            </h2>

            {noPending ? (
                <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">All Caught Up!</h3>
                    <p className="text-gray-500 mt-1">There are no pending attendance or marks requests to review.</p>
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Pending Attendance */}
                    {pendingData.attendance.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 bg-orange-50 border-b border-orange-100">
                                <h3 className="font-semibold text-orange-800">Pending Attendance ({pendingData.attendance.length})</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {pendingData.attendance.map((record) => (
                                    <div key={record.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {record.student ? `${record.student.firstName} ${record.student.lastName}` : `Student #${record.student?.id || 'N/A'}`}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Date: {record.date} • Status: <span className="font-medium">{record.status}</span>
                                            </p>
                                        </div>
                                        <div className="flex space-x-2 shrink-0">
                                            <button 
                                                onClick={() => handleAction('attendance', record.id, 'approve')}
                                                className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleAction('attendance', record.id, 'reject')}
                                                className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pending Marks */}
                    {pendingData.marks.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 bg-blue-50 border-b border-blue-100">
                                <h3 className="font-semibold text-blue-800">Pending Marks ({pendingData.marks.length})</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {pendingData.marks.map((record) => (
                                    <div key={record.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {record.student ? `${record.student.firstName} ${record.student.lastName}` : `Student #${record.student?.id || 'N/A'}`}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Subject: {record.subject} • Score: {record.marksObtained}/{record.totalMarks} • Grade: {record.grade}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2 shrink-0">
                                            <button 
                                                onClick={() => handleAction('marks', record.id, 'approve')}
                                                className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleAction('marks', record.id, 'reject')}
                                                className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Reject
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
