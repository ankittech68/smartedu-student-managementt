import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, BookOpen, CalendarCheck, TrendingUp } from 'lucide-react';
import api from '../services/api';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
        <div className={`p-4 rounded-full ${colorClass} mr-4`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        students: 0,
        attendance: '0%',
        subjects: 0,
        performance: 'N/A'
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (user?.role === 'ROLE_STUDENT') {
                    let studentId;
                    let enrollmentDate = 'N/A';
                    
                    try {
                        const profileRes = await api.get(`/students/me`);
                        studentId = profileRes.data.id;
                        enrollmentDate = profileRes.data.enrollmentDate;
                    } catch (e) {
                        setStats({
                            students: 'N/A',
                            attendance: '0%',
                            subjects: 0,
                            performance: 'N/A'
                        });
                        return;
                    }

                    const [attendanceRes, marksRes] = await Promise.all([
                        api.get(`/attendance/student/${studentId}`),
                        api.get(`/marks/student/${studentId}`)
                    ]);

                    const attData = attendanceRes.data;
                    const presentCount = attData.filter(a => a.status === 'PRESENT').length;
                    const attPerc = attData.length > 0 ? Math.round((presentCount / attData.length) * 100) + '%' : '0%';

                    const marksData = marksRes.data;
                    const uniqueSubjects = new Set(marksData.map(m => m.subject)).size;
                    
                    let performance = 'N/A';
                    if (marksData.length > 0) {
                        const totalPerc = marksData.reduce((acc, m) => acc + (m.marksObtained / m.totalMarks), 0) / marksData.length;
                        const perc = totalPerc * 100;
                        if (perc >= 90) performance = 'O';
                        else if (perc >= 80) performance = 'A+';
                        else if (perc >= 70) performance = 'A';
                        else if (perc >= 60) performance = 'B+';
                        else if (perc >= 50) performance = 'B';
                        else if (perc >= 40) performance = 'C';
                        else if (perc >= 33) performance = 'D';
                        else performance = 'F';
                    }

                    setStats({
                        students: enrollmentDate, // Repurpose field
                        attendance: attPerc,
                        subjects: uniqueSubjects,
                        performance: performance
                    });
                } else {
                    const [studentsRes, attendanceRes, marksRes] = await Promise.all([
                        api.get('/students'),
                        api.get('/attendance'),
                        api.get('/marks')
                    ]);

                    const attData = attendanceRes.data.filter(a => a.approvalStatus === 'APPROVED' || !a.approvalStatus);
                    const presentCount = attData.filter(a => a.status === 'PRESENT').length;
                    const attPerc = attData.length > 0 ? Math.round((presentCount / attData.length) * 100) + '%' : '0%';

                    const marksData = marksRes.data.filter(m => m.approvalStatus === 'APPROVED' || !m.approvalStatus);
                    const uniqueSubjects = new Set(marksData.map(m => m.subject)).size;

                    let performance = 'N/A';
                    if (marksData.length > 0) {
                        const totalPerc = marksData.reduce((acc, m) => acc + (m.marksObtained / m.totalMarks), 0) / marksData.length;
                        const perc = totalPerc * 100;
                        if (perc >= 90) performance = 'O';
                        else if (perc >= 80) performance = 'A+';
                        else if (perc >= 70) performance = 'A';
                        else if (perc >= 60) performance = 'B+';
                        else if (perc >= 50) performance = 'B';
                        else if (perc >= 40) performance = 'C';
                        else if (perc >= 33) performance = 'D';
                        else performance = 'F';
                    }

                    setStats({
                        students: studentsRes.data.length,
                        attendance: attPerc,
                        subjects: uniqueSubjects,
                        performance: performance
                    });
                }
            } catch (error) {
                console.error("Error fetching dashboard stats", error);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">Here's what's happening today.</p>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title={user?.role === 'ROLE_STUDENT' ? "Enrolled Date" : "Total Students"} 
                    value={stats.students} 
                    icon={Users} 
                    colorClass="bg-blue-500" 
                />
                <StatCard 
                    title={user?.role === 'ROLE_STUDENT' ? "My Attendance" : "Average Attendance"} 
                    value={stats.attendance} 
                    icon={CalendarCheck} 
                    colorClass="bg-green-500" 
                />
                <StatCard 
                    title={user?.role === 'ROLE_STUDENT' ? "My Subjects" : "Total Subjects"} 
                    value={stats.subjects} 
                    icon={BookOpen} 
                    colorClass="bg-purple-500" 
                />
                <StatCard 
                    title="Overall Performance" 
                    value={stats.performance} 
                    icon={TrendingUp} 
                    colorClass="bg-orange-500" 
                />
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Welcome back to SmartEdu, {user?.username}!</h2>
                <p className="text-gray-600 mb-4">
                    You are logged in as a <span className="font-semibold text-primary-600">{user?.role?.replace('ROLE_', '')}</span>.
                </p>
                
                <div className="bg-primary-50 rounded-lg p-6 border border-primary-100">
                    <h3 className="text-primary-800 font-semibold mb-2">Getting Started</h3>
                    <ul className="list-disc list-inside text-primary-700 space-y-1">
                        <li>Navigate using the sidebar to view different modules.</li>
                        <li>Manage your profile and personal details.</li>
                        {user?.role === 'ROLE_ADMIN' && <li>Add, update, or remove student records.</li>}
                        {user?.role === 'ROLE_TEACHER' && <li>Mark attendance and update grades.</li>}
                        {user?.role === 'ROLE_STUDENT' && <li>View your attendance and marks.</li>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
