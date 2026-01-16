'use client';

import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ManagerDashboard() {
    const { authState } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authState.isAuthenticated || authState.userType !== 'manager') {
            router.push('/login');
        }
    }, [authState, router]);

    if (!authState.isAuthenticated || authState.userType !== 'manager') {
        return null;
    }

    return (
        <main className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-6 py-12">

                <div className="mb-8">
                    <h1 className="text-3xl font-semibold text-slate-900 mb-2">
                        Ward Manager Dashboard
                    </h1>
                    <p className="text-slate-600">
                        Managing Ward {authState.wardNo} • {authState.username}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="relative bg-gradient-to-br from-purple-50 to-purple-100  border border-blue-200 rounded-2xl p-6 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-700 via-purple-600 to-purple-700"></div>
                        <div className="text-blue-900 text-sm font-medium mb-1">Total Complaints</div>
                        <div className="text-3xl font-bold text-blue-900">0</div>
                    </div>
                    <div className="relative bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-6 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700"></div>
                        <div className="text-amber-900 text-sm font-medium mb-1">Pending</div>
                        <div className="text-3xl font-bold text-amber-900">0</div>
                    </div>
                    <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700"></div>
                        <div className="text-blue-900 text-sm font-medium mb-1">In Progress</div>
                        <div className="text-3xl font-bold text-blue-900">0</div>
                    </div>
                    <div className="relative bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-700 via-green-600 to-green-700"></div>
                        <div className="text-green-900 text-sm font-medium mb-1">Resolved</div>
                        <div className="text-3xl font-bold text-green-900">0</div>
                    </div>
                </div>

                <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-900 via-green-800 to-green-900"></div>
                    <div className="p-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button className="px-6 py-4 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition text-left">
                                <div className="font-medium text-slate-900">View Ward Complaints</div>
                                <div className="text-sm text-slate-600 mt-1">Manage complaints in your ward</div>
                            </button>
                            <button className="px-6 py-4 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition text-left">
                                <div className="font-medium text-slate-900">Update Status</div>
                                <div className="text-sm text-slate-600 mt-1">Change complaint statuses</div>
                            </button>
                            <button className="px-6 py-4 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition text-left">
                                <div className="font-medium text-slate-900">View Analytics</div>
                                <div className="text-sm text-slate-600 mt-1">Ward performance metrics</div>
                            </button>
                        </div>
                    </div>
                    <div className="h-2 bg-gradient-to-r from-green-50 via-green-100 to-green-50"></div>
                </div>

                <div className="relative mt-8 bg-blue-50 border border-blue-200 rounded-2xl shadow-lg overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600"></div>
                    <div className="p-4">
                        <p className="text-sm text-blue-900">
                            <strong>Note:</strong> Dashboard is ready for backend integration. Connect to API endpoints to display real-time ward complaint data and analytics.
                        </p>
                    </div>
                </div>

            </div>
        </main>
    );
}
