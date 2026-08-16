import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Menu, UserCheck, ShieldCheck, User, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ toggleSidebar }) => {
    const { user, logout } = useContext(AuthContext);
    const rawRole = (user?.role || '').toUpperCase().replace(/^ROLE_/, '');

    const roleBadge = {
        ADMIN:   { label: 'Admin',   cls: 'badge badge-indigo',  Icon: ShieldCheck },
        TEACHER: { label: 'Faculty', cls: 'badge badge-purple',  Icon: UserCheck   },
        STUDENT: { label: 'Student', cls: 'badge badge-emerald', Icon: User        },
    }[rawRole] || { label: rawRole, cls: 'badge badge-slate', Icon: User };

    const RoleIcon = roleBadge.Icon;

    return (
        <header className="glass-nav h-16 flex items-center justify-between px-4 lg:px-6 z-30 sticky top-0">
            {/* Left: Hamburger + Greeting */}
            <div className="flex items-center gap-3">
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl lg:hidden transition"
                    aria-label="Toggle Sidebar"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Mobile logo placeholder */}
                <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 lg:hidden"
                >
                    <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-extrabold text-slate-900">Smart<span className="text-indigo-500">Edu</span></span>
                </Link>

                <div className="hidden sm:flex items-center gap-2.5">
                    <span className="text-sm font-semibold text-slate-700">
                        Hello, <span className="gradient-text font-extrabold">{user?.username}</span>
                    </span>
                    <span className={roleBadge.cls}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {roleBadge.label}
                    </span>
                </div>
            </div>

            {/* Right: Notifications + Avatar + Logout */}
            <div className="flex items-center gap-2">
                <NotificationDropdown />

                <div className="h-8 w-px bg-slate-200 mx-1" />

                <div
                    className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm shadow-sm"
                    title={user?.username}
                >
                    {user?.username?.charAt(0).toUpperCase()}
                </div>

                <button
                    onClick={logout}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition border border-transparent hover:border-rose-100"
                    title="Sign Out"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
