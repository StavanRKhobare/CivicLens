'use client';

import { useState, useEffect } from 'react';
import ComplaintCard from '../components/complaintcard/ComplaintCard';

export default function ComplaintsPage() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        ward: '',
        problemType: '',
        status: ''
    });
    const [page, setPage] = useState(1);

    // useEffect(() => {
    //     fetchComplaints();
    // }, [filters, page]);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                sort: 'newest',
                ...(filters.ward && { ward: filters.ward }),
                ...(filters.problemType && { problemType: filters.problemType }),
                ...(filters.status && { status: filters.status })
            });

            const response = await fetch(`/api/complaints?${params}`);
            const data = await response.json();
            setComplaints(data.complaints || []);
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setPage(1);
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

    return (
        <main className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">All Complaints</h1>
                    <p className="text-slate-600">Complete transparency - View all civic issues across Bangalore</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-green-200 p-6 mb-8">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Filter Complaints</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Ward Number</label>
                            <select
                                value={filters.ward}
                                onChange={(e) => handleFilterChange('ward', e.target.value)}
                                className="w-full px-4 py-2 border border-green-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
                            >
                                <option value="">All Wards</option>
                                {Array.from({ length: 225 }, (_, i) => i + 1).map((num) => (
                                    <option key={num} value={num}>Ward {num}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Problem Type</label>
                            <select
                                value={filters.problemType}
                                onChange={(e) => handleFilterChange('problemType', e.target.value)}
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
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-4 py-2 border border-green-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
                            >
                                <option value="">All Statuses</option>
                                {statuses.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {(filters.ward || filters.problemType || filters.status) && (
                        <button
                            onClick={() => setFilters({ ward: '', problemType: '', status: '' })}
                            className="mt-4 px-4 py-2 text-sm font-medium text-green-900 hover:text-green-800 underline"
                        >
                            Clear All Filters
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
                        <p className="text-lg text-slate-600">No complaints found matching your filters.</p>
                        <p className="text-sm text-slate-500 mt-2">Try adjusting your filter criteria.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {complaints.map((complaint) => (
                                <ComplaintCard
                                    key={complaint.id}
                                    complaint={complaint}
                                    userRole="public"
                                />
                            ))}
                        </div>

                        <div className="mt-8 flex justify-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-white border-2 border-green-900 text-green-900 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 text-slate-700 font-medium">Page {page}</span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={complaints.length === 0}
                                className="px-4 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
