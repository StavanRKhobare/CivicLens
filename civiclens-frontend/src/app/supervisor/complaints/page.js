'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ComplaintCard from '../../components/complaintcard/ComplaintCard';
import { useRouter } from 'next/navigation';

export default function SupervisorComplaintsPage() {
    const { authState } = useAuth();
    const router = useRouter();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        problemType: '',
        status: '',
        sort: 'newest'
    });

    useEffect(() => {
        if (!authState.isAuthenticated || authState.userType !== 'supervisor') {
            router.push('/login');
            return;
        }
        fetchComplaints();
    }, [authState, filters]);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                sort: filters.sort,
                ...(filters.problemType && { problemType: filters.problemType }),
                ...(filters.status && { status: filters.status })
            });

            const response = await fetch(`/api/complaints/ward/${authState.wardNo}?${params}`);
            const data = await response.json();
            setComplaints(data.complaints || []);
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    const problemTypes = [
        'Roads & Traffic Infrastructure',
        'Water & Sewerage',
        'Garbage & Waste',
        'Building & Property Violations',
        'Electricity & Streetlights',
        'Public Safety'
    ];

    const statuses = ['Pending', 'In Progress', 'Resolved'];

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' }
    ];

    return (
        <main className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Ward Complaints Overview</h1>
                    <p className="text-slate-600">
                        Ward {authState.wardNo} - Monitor all complaints and manager performance
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-green-200 p-6 mb-8">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Filter & Sort</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Problem Type</label>
                            <select
                                value={filters.problemType}
                                onChange={(e) => setFilters(prev => ({ ...prev, problemType: e.target.value }))}
                                className="w-full px-4 py-2 border border-green-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
                            >
                                <option value="">All Types</option>
                                {problemTypes.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full px-4 py-2 border border-green-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
                            >
                                <option value="">All Statuses</option>
                                {statuses.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                            <select
                                value={filters.sort}
                                onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                                className="w-full px-4 py-2 border border-green-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
                            >
                                {sortOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {(filters.problemType || filters.status) && (
                        <button
                            onClick={() => setFilters({ problemType: '', status: '', sort: 'newest' })}
                            className="mt-4 px-4 py-2 text-sm font-medium text-green-900 hover:text-green-800 underline"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-900 border-t-transparent"></div>
                        <p className="mt-4 text-slate-600">Loading complaints...</p>
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-slate-200">
                        <p className="text-lg text-slate-600">No complaints found in your ward.</p>
                        <p className="text-sm text-slate-500 mt-2">Try adjusting your filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {complaints.map((complaint) => (
                            <ComplaintCard
                                key={complaint.id}
                                complaint={complaint}
                                userRole="supervisor"
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
