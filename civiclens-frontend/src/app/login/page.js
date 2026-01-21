'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { User, Building2, Users, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const { login, authState } = useAuth();
    const router = useRouter();
    const [userType, setUserType] = useState('');
    const [role, setRole] = useState('');
    const [wardNo, setWardNo] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        if (authState.isAuthenticated) {
            if (authState.userType === 'manager') {
                router.push('/manager/complaints');
            } else if (authState.userType === 'supervisor') {
                router.push('/supervisor/complaints');
            } else {
                router.push('/complaints');
            }
        }
    }, [authState, router]);

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: '' });
        }, 3000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const result = login({
            userType: userType === 'public' ? 'public' : 'government',
            role,
            wardNo,
            username,
            password
        });

        if (!result.success) {
            setError(result.error);
            showToast('❌ ' + result.error, 'error');
        } else {
            showToast('✅ Login successful! Redirecting...', 'success');
            setTimeout(() => {
                if (role === 'manager') {
                    router.push('/manager/complaints');
                } else if (role === 'supervisor') {
                    router.push('/supervisor/complaints');
                } else {
                    router.push('/complaints');
                }
            }, 1000);
        }
    };

    const isFormValid = () => {
        if (!userType || !username || !password) return false;
        if (userType === 'government' && (!role || !wardNo)) return false;
        return true;
    };

    const resetForm = () => {
        setRole('');
        setWardNo('');
        setUsername('');
        setPassword('');
        setError('');
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-slate-50 flex items-center justify-center px-6 py-12">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg border-2 animate-slide-in ${toast.type === 'success'
                    ? 'bg-green-50 border-green-900 text-green-900'
                    : 'bg-red-50 border-red-900 text-red-900'
                    }`}>
                    <p className="font-semibold">{toast.message}</p>
                </div>
            )}

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Panel - Information */}
                <div className="hidden lg:block">
                    <div className="mb-8">
                        <h1 className="text-5xl font-bold text-green-900 mb-4">CivicLens</h1>
                        <p className="text-xl text-slate-700 mb-6">
                            Ward-Level Complaint Intelligence with Role-Based Accountability
                        </p>
                        <p className="text-base text-slate-600">
                            Unifies complaints across channels. Enforces ward-level workflow. Transparent tracking from submission to resolution.
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div className="space-y-4">
                        <div className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-green-200 p-6">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-900 via-green-800 to-green-900"></div>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <User className="w-6 h-6 text-green-900" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">For Citizens</h3>
                                    <p className="text-sm text-slate-600">View and submit civic complaints with transparent tracking</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-green-200 p-6">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-900 via-green-800 to-green-900"></div>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-green-900" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">For Government</h3>
                                    <p className="text-sm text-slate-600">Manage ward-based complaints with analytics and oversight</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-green-200 p-6">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-900 via-green-800 to-green-900"></div>
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-green-900" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Transparency</h3>
                                    <p className="text-sm text-slate-600">Public visibility and accountability for all civic issues</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-900">
                            <strong>Research Platform:</strong> For academic and demonstration purposes
                        </p>
                    </div>
                </div>

                {/* Right Panel - Login Card */}
                <div>
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-green-900 mb-2">Login Here</h1>
                        <p className="text-sm text-slate-600">Access your CivicLens account</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
                        <div className="p-8">
                            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                                Access System
                            </h2>
                            <p className="text-sm text-slate-600 mb-8">
                                Sign in to manage complaints and track resolutions
                            </p>

                            {/* Step 1: User Type Selection */}
                            {!userType && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-slate-700 mb-3">
                                        Select User Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setUserType('public')}
                                            className="flex flex-col items-center gap-3 p-6 border-2 border-green-200 rounded-lg hover:border-green-900 hover:bg-green-50 transition-all"
                                        >
                                            <User className="w-8 h-8 text-green-900" />
                                            <span className="text-sm font-semibold text-slate-900">Public User</span>
                                            <span className="text-xs text-slate-600 text-center">Citizens</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setUserType('government')}
                                            className="flex flex-col items-center gap-3 p-6 border-2 border-green-200 rounded-lg hover:border-green-900 hover:bg-green-50 transition-all"
                                        >
                                            <Building2 className="w-8 h-8 text-green-900" />
                                            <span className="text-sm font-semibold text-slate-900">Government</span>
                                            <span className="text-xs text-slate-600 text-center">Officials</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Government User - Role Selection */}
                            {userType === 'government' && !role && (
                                <div className="mb-6 animate-fade-in">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setUserType('');
                                            resetForm();
                                        }}
                                        className="text-sm text-green-900 hover:text-green-800 mb-4 flex items-center gap-1"
                                    >
                                        ← Back to user type
                                    </button>
                                    <label className="block text-sm font-medium text-slate-700 mb-3">
                                        Select Role
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setRole('manager')}
                                            className="flex flex-col items-center gap-3 p-6 border-2 border-green-200 rounded-lg hover:border-green-900 hover:bg-green-50 transition-all"
                                        >
                                            <Users className="w-8 h-8 text-green-900" />
                                            <span className="text-sm font-semibold text-slate-900">Ward Manager</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole('supervisor')}
                                            className="flex flex-col items-center gap-3 p-6 border-2 border-green-200 rounded-lg hover:border-green-900 hover:bg-green-50 transition-all"
                                        >
                                            <Building2 className="w-8 h-8 text-green-900" />
                                            <span className="text-sm font-semibold text-slate-900">Supervisor</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Government User - Ward Number */}
                            {userType === 'government' && role && !wardNo && (
                                <div className="mb-6 animate-fade-in">
                                    <button
                                        type="button"
                                        onClick={() => setRole('')}
                                        className="text-sm text-green-900 hover:text-green-800 mb-4 flex items-center gap-1"
                                    >
                                        ← Back to role selection
                                    </button>
                                    <label htmlFor="wardNo" className="block text-sm font-medium text-slate-700 mb-2">
                                        Ward Number
                                    </label>
                                    <select
                                        id="wardNo"
                                        value={wardNo}
                                        onChange={(e) => setWardNo(e.target.value)}
                                        className="w-full px-4 py-3 border border-green-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent transition-all"
                                        autoFocus
                                    >
                                        <option value="">-- Select Ward --</option>
                                        {Array.from({ length: 225 }, (_, i) => i + 1).map((num) => (
                                            <option key={num} value={num}>
                                                Ward {num}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Step 4: Credentials Input */}
                            {((userType === 'public') || (userType === 'government' && role && wardNo)) && (
                                <div className="animate-fade-in">
                                    {userType === 'government' && (
                                        <button
                                            type="button"
                                            onClick={() => setWardNo('')}
                                            className="text-sm text-green-900 hover:text-green-800 mb-4 flex items-center gap-1"
                                        >
                                            ← Back
                                        </button>
                                    )}

                                    {userType === 'public' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUserType('');
                                                resetForm();
                                            }}
                                            className="text-sm text-green-900 hover:text-green-800 mb-4 flex items-center gap-1"
                                        >
                                            ← Back to user type
                                        </button>
                                    )}

                                    {/* Username Field */}
                                    <div className="mb-5">
                                        <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                                            Username
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                id="username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder={
                                                    userType === 'public'
                                                        ? 'user1 to user10'
                                                        : `ward${wardNo}_${role}`
                                                }
                                                className="w-full pl-11 pr-4 py-3 border border-green-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Password Field */}
                                    <div className="mb-6">
                                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="password"
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && isFormValid()) {
                                                        handleSubmit(e);
                                                    }
                                                }}
                                                placeholder="Enter your password"
                                                className="w-full pl-11 pr-4 py-3 border border-green-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-800">{error}</p>
                                        </div>
                                    )}

                                    {/* Sign In Button */}
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={!isFormValid()}
                                        className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-semibold shadow-sm transition-colors ${isFormValid()
                                            ? 'bg-green-900 text-white hover:bg-green-800'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Sign In
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer Accent */}
                        <div className="h-1 bg-gradient-to-r from-green-100 via-green-200 to-green-100"></div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
                
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </main>
    );
}