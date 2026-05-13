import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/signin', { username, password });
            if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
                setUser(response.data);
                toast.success('Logged in successfully!');
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed!');
            return false;
        }
    };

    const register = async (username, email, password, role) => {
        try {
            await api.post('/auth/signup', { username, email, password, role });
            toast.success('Registration successful! Please login.');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed!');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        toast.success('Logged out successfully!');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
