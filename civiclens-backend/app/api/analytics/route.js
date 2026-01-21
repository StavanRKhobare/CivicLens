import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const wardNo = searchParams.get('ward_no');

        if (!wardNo) {
            return NextResponse.json(
                { success: false, error: 'Ward number is required' },
                { status: 400 }
            );
        }

        // Fetch all complaints for the ward
        const { data, error } = await supabase
            .from('SummaryTable')
            .select('manager_workflow_status, supervisor_verified')
            .eq('ward_no', wardNo);

        if (error) {
            console.error('[Analytics DB Error]:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch analytics data' },
                { status: 500 }
            );
        }

        // Initialize counters
        const stats = {
            manager: {
                total_complaints: 0,
                pending: 0,
                in_progress: 0,
                resolved: 0
            },
            supervisor: {
                total_submissions: 0, // Complaints marked as 'Resolved' by manager
                pending_review: 0,    // 'Resolved' but not yet verified
                verified: 0           // 'Resolved' and verified
            }
        };

        // Aggregate data
        (data || []).forEach(item => {
            // Manager Stats
            stats.manager.total_complaints++;

            const status = item.manager_workflow_status;
            if (status === 'Pending') stats.manager.pending++;
            else if (status === 'In Progress') stats.manager.in_progress++;
            else if (status === 'Resolved') stats.manager.resolved++;

            // Supervisor Stats
            // Only consider complaints that are 'Resolved' by manager as submissions to supervisor
            if (status === 'Resolved') {
                stats.supervisor.total_submissions++;

                if (item.supervisor_verified) {
                    stats.supervisor.verified++;
                } else {
                    stats.supervisor.pending_review++;
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: stats
        });

    } catch (err) {
        console.error('[GET /api/analytics Error]:', err);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
