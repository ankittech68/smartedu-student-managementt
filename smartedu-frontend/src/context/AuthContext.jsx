import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.warn('Failed to parse stored user data, clearing:', e);
            localStorage.removeItem('user');
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post(`${import.meta.env.VITE_API_URL}/auth/signin`, { username, password });
            if (response.data && response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
                setUser(response.data);
                toast.success('Logged in successfully!');
                return true;
            }
            toast.error('Login failed: No token received from server.');
            return false;
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.data?.message 
                || error.message 
                || 'Login failed! Please try again.';
            toast.error(message);
            return false;
        }
    };

    const register = async (username, email, password, role) => {
        try {
            await api.post(`${import.meta.env.VITE_API_URL}/auth/signup`, { username, email, password, role });
            toast.success('Registration successful! Please login.');
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            const message = error.response?.data?.message 
                || error.message 
                || 'Registration failed! Please try again.';
            toast.error(message);
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
