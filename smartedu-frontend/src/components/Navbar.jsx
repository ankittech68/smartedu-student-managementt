import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ toggleSidebar }) => {
    const { user, logout } = useContext(AuthContext);

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0">
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="p-2 mr-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg lg:hidden"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold text-gray-800 hidden sm:block">Welcome back, {user?.username}</h1>
            </div>

            <div className="flex items-center space-x-4">
                <NotificationDropdown />

                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200 shadow-sm">
                    {user?.username?.charAt(0).toUpperCase()}
                </div>
                
                <button 
                    onClick={logout}
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-red-600 transition-colors ml-4"
                >
                    <LogOut className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
