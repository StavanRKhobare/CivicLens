'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Send } from 'lucide-react';

/**
 * ComplaintCard - Pure Presentation Component
 * 
 * Renders a single complaint using backend-supplied data.
 * Does not compute, infer, or modify complaint data.
 * All attributes are authoritative backend data from the database.
 * 
 * @param {Object} complaint - Backend-supplied complaint object
 * @param {string} userRole - Current user's role (public, manager, supervisor)
 * @param {Function} onStatusUpdate - Callback for status updates (manager only)
 * @param {Function} onReportDownload - Callback for report download (manager only)
 * @param {Function} onReportSubmit - Callback for report submission to supervisor (manager only)
 */
export default function ComplaintCard({
    complaint,
    userRole = 'public',
    onStatusUpdate,
    onReportDownload,
    onReportSubmit
}) {
    const [showRemarks, setShowRemarks] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const formatDisplayId = () => {
        if (!complaint.ward_no || !complaint.created_at) return complaint.id || 'N/A';

        const date = new Date(complaint.created_at);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const postNo = String(complaint.complaint_seq || 1).padStart(3, '0');

        return `${complaint.ward_no}-${day}${month}-${postNo}`;
    };

    const getCardStyles = () => {
        switch (complaint.status) {
            case 'Resolved':
                return 'bg-gradient-to-br from-green-50 to-green-100 border-green-200';
            case 'Pending':
                return 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200';
            case 'In Progress':
                return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200';
            case 'Unattempted':
                return 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200';
            default:
                return 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200';
        }
    };

    const getBadgeStyles = () => {
        switch (complaint.status) {
            case 'Resolved':
                return 'bg-green-100 text-green-900 border-green-300';
            case 'Pending':
                return 'bg-amber-100 text-amber-900 border-amber-300';
            case 'In Progress':
                return 'bg-blue-100 text-blue-900 border-blue-300';
            case 'Unattempted':
                return 'bg-slate-100 text-slate-900 border-slate-300';
            default:
                return 'bg-slate-100 text-slate-900 border-slate-300';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleStatusChange = async (newStatus) => {
        if (userRole !== 'manager' || !onStatusUpdate) return;

        setIsUpdating(true);
        try {
            await onStatusUpdate(complaint.id, newStatus);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className={`relative rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${getCardStyles()}`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-900 via-green-800 to-green-900"></div>

            <div className="p-6 pt-8">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Complaint ID</span>
                        <p className="text-lg font-bold text-slate-900 font-mono">{formatDisplayId()}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getBadgeStyles()}`}>
                        {complaint.status || 'Unknown'}
                    </span>
                </div>

                <div className="mb-4">
                    <h3 className="text-base font-semibold text-slate-900 mb-2">
                        {complaint.summary || 'No summary provided'}
                    </h3>
                    <p className="text-sm text-slate-600">
                        {complaint.address || 'No address provided'}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-white/50 rounded-lg">
                    <div>
                        <span className="text-xs font-medium text-slate-500">Problem Type</span>
                        <p className="text-sm font-semibold text-slate-900">{complaint.problem_type || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-xs font-medium text-slate-500">Ward Number</span>
                        <p className="text-sm font-semibold text-slate-900">{complaint.ward_no || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-xs font-medium text-slate-500">Submitted On</span>
                        <p className="text-sm font-semibold text-slate-900">{formatDate(complaint.created_at)}</p>
                    </div>
                    <div>
                        <span className="text-xs font-medium text-slate-500">Last Updated</span>
                        <p className="text-sm font-semibold text-slate-900">{formatDate(complaint.updated_at)}</p>
                    </div>
                </div>

                {complaint.status === 'Resolved' && complaint.remarks && (
                    <div className="mb-4">
                        <button
                            onClick={() => setShowRemarks(!showRemarks)}
                            className="w-full flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                        >
                            <span className="text-sm font-semibold text-green-900">View Official Remarks</span>
                            {showRemarks ? (
                                <ChevronUp className="w-4 h-4 text-green-900" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-green-900" />
                            )}
                        </button>

                        {showRemarks && (
                            <div className="mt-2 p-4 bg-white border border-green-200 rounded-lg">
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{complaint.remarks}</p>
                            </div>
                        )}
                    </div>
                )}

                {userRole === 'manager' && (
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-2">Update Status</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleStatusChange('Pending')}
                                    disabled={isUpdating || complaint.status === 'Pending'}
                                    className="flex-1 px-3 py-2 text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 rounded-lg hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Pending
                                </button>
                                <button
                                    onClick={() => handleStatusChange('In Progress')}
                                    disabled={isUpdating || complaint.status === 'In Progress'}
                                    className="flex-1 px-3 py-2 text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    In Progress
                                </button>
                                <button
                                    onClick={() => handleStatusChange('Resolved')}
                                    disabled={isUpdating || complaint.status === 'Resolved'}
                                    className="flex-1 px-3 py-2 text-xs font-semibold bg-green-100 text-green-900 border border-green-300 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Resolved
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => onReportDownload && onReportDownload(complaint.id)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-white text-slate-900 border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <FileText className="w-4 h-4" />
                                Download Report
                            </button>
                            <button
                                onClick={() => onReportSubmit && onReportSubmit(complaint.id)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-green-900 text-white rounded-lg hover:bg-green-800 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                                Submit to Supervisor
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="h-2 bg-gradient-to-r from-green-50 via-green-100 to-green-50"></div>
        </div>
    );
}
