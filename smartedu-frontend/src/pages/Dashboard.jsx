import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, BookOpen, CalendarCheck, TrendingUp, CheckSquare, PlusCircle, UserPlus, ArrowRight, BarChart2, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

/* ── Stat Card ── */
const StatCard = ({ title, value, subtitle, icon: Icon, accentClass, iconBg }) => (
    <div className={`glass-card-hover section-card stat-card-accent ${accentClass} p-5 animate-fade-in-up`}>
        <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">{title}</p>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight truncate">{value}</h3>
                {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
            </div>
            <div className={`p-3.5 rounded-2xl ${iconBg} shadow-sm ml-4 shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
        </div>
    </div>
);

/* ── Quick Action Card ── */
const QuickCard = ({ to, icon: Icon, label, colorClass }) => (
    <Link to={to} className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 group hover:-translate-y-0.5 ${colorClass}`}>
        <div className="flex items-center space-x-3">
            <Icon className="w-4 h-4" />
            <span className="text-sm font-semibold">{label}</span>
        </div>
        <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
    </Link>
);

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const rawRole = (user?.role || '').toUpperCase().replace(/^ROLE_/, '');

    const [stats, setStats] = useState({ students: 0, attendance: '0%', subjects: 0, performance: 'N/A' });
    const [attendanceCounts, setAttendanceCounts] = useState({ present: 0, absent: 0, late: 0 });
    const [subjectPerformance, setSubjectPerformance] = useState({ labels: [], data: [] });
    const [hasMarksData, setHasMarksData] = useState(false);
    const [hasAttendanceData, setHasAttendanceData] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (rawRole === 'STUDENT') {
                    let studentId;
                    let enrollmentDate = 'N/A';

                    try {
                        const profileRes = await api.get(`/students/me`);
                        studentId = profileRes.data.id;
                        enrollmentDate = profileRes.data.enrollmentDate || 'N/A';
                    } catch {
                        setStats({ students: 'N/A', attendance: '0%', subjects: 0, performance: 'N/A' });
                        return;
                    }

                    const [attendanceRes, marksRes] = await Promise.all([
                        api.get(`/attendance/student/${studentId}`),
                        api.get(`/marks/student/${studentId}`)
                    ]);

                    const attData = attendanceRes.data || [];
                    const presentCount = attData.filter(a => a.status === 'PRESENT').length;
                    const absentCount = attData.filter(a => a.status === 'ABSENT').length;
                    const lateCount = attData.filter(a => a.status === 'LATE').length;
                    setAttendanceCounts({ present: presentCount, absent: absentCount, late: lateCount });
                    setHasAttendanceData(attData.length > 0);

                    const attPerc = attData.length > 0
                        ? Math.round((presentCount / attData.length) * 100) + '%'
                        : '0%';

                    const marksData = marksRes.data || [];
                    setHasMarksData(marksData.length > 0);

                    const subjectMap = {};
                    marksData.forEach(m => {
                        if (!subjectMap[m.subject]) subjectMap[m.subject] = [];
                        subjectMap[m.subject].push((m.marksObtained / m.totalMarks) * 100);
                    });
                    const labels = Object.keys(subjectMap);
                    const avgData = labels.map(sub => {
                        const scores = subjectMap[sub];
                        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                    });
                    setSubjectPerformance({ labels, data: avgData });

                    let performance = 'N/A';
                    if (marksData.length > 0) {
                        const totalPerc = marksData.reduce((acc, m) => acc + (m.marksObtained / m.totalMarks), 0) / marksData.length * 100;
                        if (totalPerc >= 90) performance = 'O';
                        else if (totalPerc >= 80) performance = 'A+';
                        else if (totalPerc >= 70) performance = 'A';
                        else if (totalPerc >= 60) performance = 'B+';
                        else if (totalPerc >= 50) performance = 'B';
                        else if (totalPerc >= 40) performance = 'C';
                        else if (totalPerc >= 33) performance = 'D';
                        else performance = 'F';
                    }

                    setStats({ students: enrollmentDate, attendance: attPerc, subjects: labels.length, performance });
                } else {
                    const [studentsRes, attendanceRes, marksRes] = await Promise.all([
                        api.get('/students'),
                        api.get('/attendance'),
                        api.get('/marks')
                    ]);

                    const allAtt = attendanceRes.data || [];
                    const approvedAtt = allAtt.filter(a => a.approvalStatus === 'APPROVED' || !a.approvalStatus);
                    const presentCount = approvedAtt.filter(a => a.status === 'PRESENT').length;
                    const absentCount = approvedAtt.filter(a => a.status === 'ABSENT').length;
                    const lateCount = approvedAtt.filter(a => a.status === 'LATE').length;
                    setAttendanceCounts({ present: presentCount, absent: absentCount, late: lateCount });
                    setHasAttendanceData(approvedAtt.length > 0);

                    const attPerc = approvedAtt.length > 0
                        ? Math.round((presentCount / approvedAtt.length) * 100) + '%'
                        : '0%';

                    const marksData = (marksRes.data || []).filter(m => m.approvalStatus === 'APPROVED' || !m.approvalStatus);
                    setHasMarksData(marksData.length > 0);

                    const subjectMap = {};
                    marksData.forEach(m => {
                        if (!subjectMap[m.subject]) subjectMap[m.subject] = [];
                        subjectMap[m.subject].push((m.marksObtained / m.totalMarks) * 100);
                    });
                    const labels = Object.keys(subjectMap);
                    const avgData = labels.map(sub => {
                        const scores = subjectMap[sub];
                        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                    });
                    setSubjectPerformance({ labels, data: avgData });

                    let performance = 'N/A';
                    if (marksData.length > 0) {
                        const totalPerc = marksData.reduce((acc, m) => acc + (m.marksObtained / m.totalMarks), 0) / marksData.length * 100;
                        if (totalPerc >= 90) performance = 'O';
                        else if (totalPerc >= 80) performance = 'A+';
                        else if (totalPerc >= 70) performance = 'A';
                        else if (totalPerc >= 60) performance = 'B+';
                        else if (totalPerc >= 50) performance = 'B';
                        else if (totalPerc >= 40) performance = 'C';
                        else if (totalPerc >= 33) performance = 'D';
                        else performance = 'F';
                    }

                    setStats({ students: (studentsRes.data || []).length, attendance: attPerc, subjects: labels.length, performance });
                }
            } catch (error) {
                console.error('Error fetching dashboard stats', error);
            }
        };

        if (user) fetchDashboardData();
    }, [user, rawRole]);

    /* ── Chart data (only real data, no fake fallback) ── */
    const doughnutData = {
        labels: ['Present', 'Absent', 'Late'],
        datasets: [{
            data: [attendanceCounts.present, attendanceCounts.absent, attendanceCounts.late],
            backgroundColor: ['#10b981', '#f43f5e', '#f59e0b'],
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 6
        }]
    };

    const barData = {
        labels: subjectPerformance.labels,
        datasets: [{
            label: 'Avg Score (%)',
            data: subjectPerformance.data,
            backgroundColor: (ctx) => {
                const v = ctx.raw;
                if (v >= 75) return 'rgba(16,185,129,0.85)';
                if (v >= 50) return 'rgba(99,102,241,0.85)';
                return 'rgba(244,63,94,0.85)';
            },
            borderRadius: 8,
            borderSkipped: false,
        }]
    };

    return (
        <div className="space-y-7 animate-fade-in-up">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="page-title">
                        Analytics <span className="gradient-text">Dashboard</span>
                    </h1>
                    <p className="page-subtitle">Real-time academic insights & management overview</p>
                </div>
                <div className="flex items-center gap-3">
                    {rawRole === 'ADMIN' && (
                        <Link
                            to="/approvals"
                            className="btn-primary"
                        >
                            <CheckSquare className="w-4 h-4 mr-2" />
                            Pending Approvals
                        </Link>
                    )}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title={rawRole === 'STUDENT' ? 'Enrollment Date' : 'Total Students'}
                    value={stats.students}
                    subtitle={rawRole === 'STUDENT' ? 'Registered Student' : 'Active Enrollments'}
                    icon={Users}
                    accentClass="accent-indigo"
                    iconBg="gradient-bg"
                />
                <StatCard
                    title={rawRole === 'STUDENT' ? 'My Attendance' : 'Avg Attendance'}
                    value={stats.attendance}
                    subtitle="Overall Percentage"
                    icon={CalendarCheck}
                    accentClass="accent-teal"
                    iconBg="gradient-bg-teal"
                />
                <StatCard
                    title={rawRole === 'STUDENT' ? 'My Subjects' : 'Subjects Tracked'}
                    value={stats.subjects}
                    subtitle="Academic Courses"
                    icon={BookOpen}
                    accentClass="accent-purple"
                    iconBg="bg-gradient-to-br from-purple-500 to-violet-600"
                />
                <StatCard
                    title="Overall Grade"
                    value={stats.performance}
                    subtitle="Performance Rating"
                    icon={TrendingUp}
                    accentClass="accent-amber"
                    iconBg="gradient-bg-amber"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Attendance Doughnut */}
                <div className="section-card glass-card-hover p-6 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-slate-900">Attendance Breakdown</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Present · Absent · Late distribution</p>
                    </div>
                    {hasAttendanceData ? (
                        <div className="h-56 flex items-center justify-center">
                            <Doughnut
                                data={doughnutData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: { boxWidth: 10, padding: 16, font: { size: 11, family: 'Inter' } }
                                        }
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <div className="h-56 flex flex-col items-center justify-center text-slate-300">
                            <CalendarCheck className="w-10 h-10 mb-2" />
                            <p className="text-xs font-medium text-slate-400">No attendance records yet</p>
                        </div>
                    )}
                </div>

                {/* Subject Performance Bar */}
                <div className="section-card glass-card-hover p-6 lg:col-span-2 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-slate-900">Subject Performance</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Average marks (%) across all subjects</p>
                    </div>
                    {hasMarksData ? (
                        <div className="h-56">
                            <Bar
                                data={barData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            callbacks: {
                                                label: ctx => ` ${ctx.raw}%`
                                            }
                                        }
                                    },
                                    scales: {
                                        y: {
                                            min: 0, max: 100,
                                            ticks: { stepSize: 25, callback: v => v + '%', font: { size: 11 } },
                                            grid: { color: '#f1f5f9' }
                                        },
                                        x: {
                                            ticks: { font: { size: 11 } },
                                            grid: { display: false }
                                        }
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <div className="h-56 flex flex-col items-center justify-center text-slate-300">
                            <BarChart2 className="w-10 h-10 mb-2" />
                            <p className="text-xs font-medium text-slate-400">No marks data available yet</p>
                            <p className="text-[11px] text-slate-300 mt-1">Add marks records to see performance charts</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Navigation */}
            <div className="section-card p-6">
                <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-900">Quick Navigation</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(rawRole === 'ADMIN' || rawRole === 'TEACHER') && (
                        <QuickCard
                            to="/students"
                            icon={UserPlus}
                            label="Manage Students"
                            colorClass="bg-indigo-50 hover:bg-indigo-100 border-indigo-100 text-indigo-700"
                        />
                    )}
                    <QuickCard
                        to="/attendance"
                        icon={PlusCircle}
                        label="Attendance Log"
                        colorClass="bg-teal-50 hover:bg-teal-100 border-teal-100 text-teal-700"
                    />
                    <QuickCard
                        to="/marks"
                        icon={BookOpen}
                        label="Marks & Report Cards"
                        colorClass="bg-purple-50 hover:bg-purple-100 border-purple-100 text-purple-700"
                    />
                    <QuickCard
                        to="/profile"
                        icon={Users}
                        label="My Profile"
                        colorClass="bg-amber-50 hover:bg-amber-100 border-amber-100 text-amber-700"
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
