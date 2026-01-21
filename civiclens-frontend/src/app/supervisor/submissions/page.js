'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { FileText, CheckCircle, XCircle, Calendar } from 'lucide-react';

export default function SupervisorSubmissionsPage() {
    const { authState } = useAuth();
    const router = useRouter();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        if (!authState.isAuthenticated || authState.userType !== 'supervisor') {
            router.push('/login');
            return;
        }
        fetchSubmissions();
    }, [authState, filter]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                sort: 'newest',
                ...(filter && { verified: filter })
            });

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/submissions?ward=${authState.wardNo}&${params}`);
            const data = await response.json();
            setSubmissions(data.submissions || []);
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
            setSubmissions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleVerification = async (summaryId, verified) => { // Changed reportId to summaryId
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/supervisor-verify`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary_id: summaryId, verified }) // Using correct backend payload
            });

            if (response.ok) {
                fetchSubmissions();
            }
        } catch (error) {
            console.error('Failed to update verification:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Report Submissions</h1>
                    <p className="text-slate-600">
                        Ward {authState.wardNo} - Verify completed work and resolution reports
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-green-200 p-6 mb-8">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Filter by Verification Status</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setFilter('')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === ''
                                ? 'bg-green-900 text-white'
                                : 'bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            All Submissions
                        </button>
                        <button
                            onClick={() => setFilter('true')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'true'
                                ? 'bg-green-900 text-white'
                                : 'bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            Verified
                        </button>
                        <button
                            onClick={() => setFilter('false')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'false'
                                ? 'bg-green-900 text-white'
                                : 'bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            Unverified
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-900 border-t-transparent"></div>
                        <p className="mt-4 text-slate-600">Loading submissions...</p>
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-slate-200">
                        <p className="text-lg text-slate-600">No submissions found.</p>
                        <p className="text-sm text-slate-500 mt-2">Managers haven't submitted any reports yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {submissions.map((submission) => (
                            <div
                                key={submission.id}
                                className="relative bg-white rounded-2xl border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-900 via-green-800 to-green-900"></div>

                                <div className="p-6 pt-8">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Report ID</span>
                                            <p className="text-lg font-bold text-slate-900 font-mono">{submission.id}</p>
                                        </div>
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${submission.verified
                                            ? 'bg-green-100 text-green-900 border-green-300'
                                            : 'bg-amber-100 text-amber-900 border-amber-300'
                                            }`}>
                                            {submission.verified ? 'Verified' : 'Pending Verification'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <span className="text-xs font-medium text-slate-500">Submitted By</span>
                                            <p className="text-sm font-semibold text-slate-900">{submission.manager_id || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-slate-500">Submission Date</span>
                                            <p className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(submission.submitted_at)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-slate-500">Complaints Resolved</span>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {submission.complaint_ids?.length || 0} complaint(s)
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-slate-500">Ward Number</span>
                                            <p className="text-sm font-semibold text-slate-900">{submission.ward_no}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                                        <button
                                            onClick={() => window.open(submission.pdf_url, '_blank')}
                                            disabled={!submission.pdf_url}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-700 border-2 border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                                        >
                                            <FileText className="w-4 h-4" />
                                            View Report
                                        </button>
                                        <button
                                            onClick={() => handleVerification(submission.id, true)}
                                            disabled={submission.verified}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-900 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Mark Verified
                                        </button>
                                        <button
                                            onClick={() => handleVerification(submission.id, false)}
                                            disabled={!submission.verified}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Unverify
                                        </button>
                                    </div>
                                </div>

                                <div className="h-2 bg-gradient-to-r from-green-50 via-green-100 to-green-50"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
