import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const wardNo = searchParams.get('ward');
        const verifiedFilter = searchParams.get('verified');
        const sort = searchParams.get('sort') || 'newest';

        if (!wardNo) {
            return NextResponse.json({ success: false, error: 'Ward number is required' }, { status: 400 });
        }

        let query = supabase
            .from('SummaryTable')
            .select('*')
            .eq('ward_no', wardNo)
            .eq('manager_workflow_status', 'Resolved')
            .not('pdfPath', 'is', null); // Only fetch those with generated reports

        // Filter by verification status if provided
        if (verifiedFilter === 'true') {
            query = query.eq('supervisor_verified', true);
        } else if (verifiedFilter === 'false') {
            query = query.eq('supervisor_verified', false);
        }

        // Sorting
        if (sort === 'newest') {
            query = query.order('created_at', { ascending: false });
        } else {
            query = query.order('created_at', { ascending: true });
        }

        const { data: submissions, error } = await query;

        if (error) {
            console.error('Database Fetch Error:', error);
            throw error;
        }

        // Map to frontend expected format if needed, or return directly
        // Frontend expects: id, verified, manager_id, submitted_at, pdf_url (or path)
        const formattedSubmissions = submissions.map(sub => ({
            id: sub.summaryId, // Using summaryId as the main ID
            report_id: sub.id, // DB primary key
            title: `Complaint Resolution #${sub.summaryId}`,
            verified: sub.supervisor_verified,
            manager_id: `Ward ${sub.ward_no} Manager`,
            submitted_at: sub.created_at,
            pdf_url: sub.pdfPath,
            complaint_ids: [sub.summaryId] // Added to fix "0 complaints" display. Assuming 1-to-1 for now.
        }));

        return NextResponse.json({ success: true, submissions: formattedSubmissions });

    } catch (error) {
        console.error('Error fetching submissions:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
