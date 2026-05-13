import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, CalendarCheck, BookOpen, UserCircle, X } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user } = useContext(AuthContext);

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ROLE_ADMIN', 'ROLE_TEACHER', 'ROLE_STUDENT'] },
        { path: '/students', label: 'Students', icon: Users, roles: ['ROLE_ADMIN', 'ROLE_TEACHER'] },
        { path: '/attendance', label: 'Attendance', icon: CalendarCheck, roles: ['ROLE_ADMIN', 'ROLE_TEACHER', 'ROLE_STUDENT'] },
        { path: '/marks', label: 'Marks & Grades', icon: BookOpen, roles: ['ROLE_ADMIN', 'ROLE_TEACHER', 'ROLE_STUDENT'] },
        { path: '/approvals', label: 'Approvals', icon: CalendarCheck, roles: ['ROLE_ADMIN'] },
        { path: '/profile', label: 'My Profile', icon: UserCircle, roles: ['ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_ADMIN'] },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-screen bg-white w-64 shadow-xl border-r border-gray-200 z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-auto lg:z-auto`}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
                    <h2 className="text-2xl font-extrabold text-primary-600 tracking-tight">SmartEdu</h2>
                    <button onClick={toggleSidebar} className="lg:hidden text-gray-500 hover:text-gray-800">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="px-4 py-6 space-y-1">
                    {navItems.map((item) => {
                        // Check if the item should be visible based on user role
                        const hasAccess = user && item.roles.includes(user.role);
                        if (!hasAccess) return null;

                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => { if (window.innerWidth < 1024) toggleSidebar() }}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 rounded-lg transition-colors font-medium ${
                                        isActive
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
