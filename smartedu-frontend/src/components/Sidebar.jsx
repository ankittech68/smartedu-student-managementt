import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    LayoutDashboard, Users, CalendarCheck, BookOpen,
    UserCircle, X, CheckSquare, GraduationCap
} from 'lucide-react';

const navItems = [
    { path: '/dashboard', label: 'Dashboard',            icon: LayoutDashboard, roles: ['ADMIN','TEACHER','STUDENT'] },
    { path: '/students',  label: 'Students',            icon: Users,            roles: ['ADMIN','TEACHER']           },
    { path: '/attendance',label: 'Attendance Log',       icon: CalendarCheck,    roles: ['ADMIN','TEACHER','STUDENT'] },
    { path: '/marks',     label: 'Marks & Report Cards', icon: BookOpen,         roles: ['ADMIN','TEACHER','STUDENT'] },
    { path: '/approvals', label: 'Pending Approvals',    icon: CheckSquare,      roles: ['ADMIN']                     },
    { path: '/profile',   label: 'My Profile',           icon: UserCircle,       roles: ['ADMIN','TEACHER','STUDENT'] },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user } = useContext(AuthContext);
    const userRole = (user?.role || '').toUpperCase().replace(/^ROLE_/, '');

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <aside className={`
                fixed top-0 left-0 h-screen w-64 z-50
                bg-slate-950 text-white
                flex flex-col
                border-r border-slate-800/80
                shadow-2xl shadow-slate-950/50
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:h-auto lg:z-auto
            `}>
                {/* Logo Header */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 shrink-0">
                    <Link
                        to="/dashboard"
                        className="flex items-center space-x-3 group"
                        title="Go to Dashboard"
                    >
                        <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:shadow-indigo-500/50 transition-all duration-200">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold tracking-tight text-white group-hover:text-indigo-300 transition-colors duration-200">
                                Smart<span className="text-indigo-400">Edu</span>
                            </h2>
                            <p className="text-[10px] text-slate-500 -mt-0.5">Management Portal</p>
                        </div>
                    </Link>
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
                    <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-3">
                        Navigation
                    </p>
                    {navItems.map((item) => {
                        if (!item.roles.includes(userRole)) return null;
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
                                className={({ isActive }) =>
                                    `flex items-center px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm group ${
                                        isActive
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                            : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-150 ${
                                            isActive ? 'bg-white/20' : 'bg-slate-800/60 group-hover:bg-slate-700/60'
                                        }`}>
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                                        </span>
                                        {item.label}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Bottom Card */}
                <div className="p-4 shrink-0">
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3.5 flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
                            <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">SmartEdu Portal</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Student Management</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
