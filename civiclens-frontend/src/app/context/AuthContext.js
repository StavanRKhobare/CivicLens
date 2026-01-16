'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        userType: null,
        username: null,
        wardNo: null,
        role: null
    });
    const router = useRouter();

    // Load auth state from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('civicLensAuth');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setAuthState(parsed);
            } catch (e) {
                localStorage.removeItem('civicLensAuth');
            }
        }
    }, []);

    // Save auth state to localStorage whenever it changes
    useEffect(() => {
        if (authState.isAuthenticated) {
            localStorage.setItem('civicLensAuth', JSON.stringify(authState));
        } else {
            localStorage.removeItem('civicLensAuth');
        }
    }, [authState]);

    const login = (credentials) => {
        const { userType, role, wardNo, username, password } = credentials;

        // Validate Public User
        if (userType === 'public') {
            const userNum = parseInt(username.replace('user', ''));
            if (username.match(/^user\d+$/) && userNum >= 1 && userNum <= 10 && password === 'public123') {
                setAuthState({
                    isAuthenticated: true,
                    userType: 'public',
                    username,
                    wardNo: null,
                    role: null
                });
                router.push('/');
                return { success: true };
            }
        }

        // Validate Government User - Ward Manager
        if (userType === 'government' && role === 'manager') {
            const expectedUsername = `ward${wardNo}_manager`;
            if (username === expectedUsername && password === 'manager123') {
                setAuthState({
                    isAuthenticated: true,
                    userType: 'manager',
                    username,
                    wardNo: parseInt(wardNo),
                    role: 'Ward Manager'
                });
                router.push('/manager/dashboard');
                return { success: true };
            }
        }

        // Validate Government User - Ward Supervisor
        if (userType === 'government' && role === 'supervisor') {
            const expectedUsername = `ward${wardNo}_supervisor`;
            if (username === expectedUsername && password === 'supervisor123') {
                setAuthState({
                    isAuthenticated: true,
                    userType: 'supervisor',
                    username,
                    wardNo: parseInt(wardNo),
                    role: 'Ward Supervisor'
                });
                router.push('/supervisor/dashboard');
                return { success: true };
            }
        }

        return { success: false, error: 'Invalid credentials' };
    };

    const logout = () => {
        setAuthState({
            isAuthenticated: false,
            userType: null,
            username: null,
            wardNo: null,
            role: null
        });
        router.push('/');
    };

    const checkAccess = (requiredRole) => {
        if (!authState.isAuthenticated) return false;

        if (Array.isArray(requiredRole)) {
            return requiredRole.includes(authState.userType);
        }

        return authState.userType === requiredRole;
    };

    return (
        <AuthContext.Provider value={{ authState, login, logout, checkAccess }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
