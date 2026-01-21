import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'user_id parameter is required' }, { status: 400 });
        }

        // Step 1: Get complaint IDs submitted by this user
        const { data: userComplaints, error: complaintError } = await supabase
            .from('ComplaintTable')
            .select('id')
            .eq('submitted_by', userId);

        if (complaintError) {
            console.error('ComplaintTable query error:', complaintError);
            return NextResponse.json({ success: false, error: complaintError.message }, { status: 500 });
        }

        if (!userComplaints || userComplaints.length === 0) {
            return NextResponse.json({
                success: true,
                count: 0,
                data: []
            });
        }

        // Step 2: Get summary IDs from the mapping table
        const complaintIds = userComplaints.map(c => c.id);
        const { data: mappings, error: mapError } = await supabase
            .from('SummaryComplaintMap')
            .select('summary_id')
            .in('complaint_id', complaintIds);

        if (mapError) {
            console.error('SummaryComplaintMap query error:', mapError);
            return NextResponse.json({ success: false, error: mapError.message }, { status: 500 });
        }

        if (!mappings || mappings.length === 0) {
            return NextResponse.json({
                success: true,
                count: 0,
                data: []
            });
        }

        // Step 3: Get the full summary records
        const summaryIds = mappings.map(m => m.summary_id);
        const { data: summaries, error: summaryError } = await supabase
            .from('SummaryTable')
            .select('*')
            .in('summaryId', summaryIds)
            .order('created_at', { ascending: false });

        if (summaryError) {
            console.error('SummaryTable query error:', summaryError);
            return NextResponse.json({ success: false, error: summaryError.message }, { status: 500 });
        }

        // Map to frontend expected format (same as main complaints endpoint)
        const mappedData = (summaries || []).map(item => ({
            id: `c${item.ward_no}-${item.summaryId}`,
            ward_no: item.ward_no,
            complaint_seq: item.summaryId,
            summary: item.summary,
            address: item.ward_name || `Ward ${item.ward_no}`,
            problem_type: item.problem_type || 'General',
            status: item.manager_workflow_status || 'Pending',
            created_at: item.created_at,
            updated_at: item.supervisor_verified_at || item.created_at,
            remarks: item.managerRemarks,
            pdf_status: item.pdfStatus,
            pdf_path: item.pdfPath,
            supervisor_verified: item.supervisor_verified,
            complaint_count: item.complaint_count
        }));

        return NextResponse.json({
            success: true,
            count: mappedData.length,
            data: mappedData
        });

    } catch (err) {
        console.error('[User Complaints Error]:', err);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
