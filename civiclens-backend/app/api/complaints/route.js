import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const MIN_DESC_LENGTH = 20;
const MAX_DESC_LENGTH = 3000;
const VALID_USER_REGEX = /^[a-zA-Z0-9_]+$/;

export async function POST(request) {
    try {
        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return NextResponse.json(
                { success: false, error: 'Invalid Content-Type. Expected application/json' },
                { status: 415 }
            );
        }

        let body;
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON body' },
                { status: 400 }
            );
        }

        const { raw_text, submitted_by } = body;

        if (!raw_text || typeof raw_text !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Complaint description is required and must be a string' },
                { status: 400 }
            );
        }

        const trimmedText = raw_text.trim();
        if (trimmedText.length < MIN_DESC_LENGTH) {
            return NextResponse.json(
                { success: false, error: `Description must be at least ${MIN_DESC_LENGTH} characters. Currently: ${trimmedText.length}` },
                { status: 400 }
            );
        }

        const ADDRESS_REGEX = /(?:near|opp|opposite|behind|street|road|rd|st|cross|main|junction|circle|layout|block|sector|ward|colony|nagar|puram|halli|pet|market|temple|school|hospital|park)/i;

        if (!ADDRESS_REGEX.test(trimmedText)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Description must contain location details (e.g., 'Near', 'Road', 'Street', 'Ward', 'Layout')."
                },
                { status: 400 }
            );
        }

        if (trimmedText.length > MAX_DESC_LENGTH) {
            return NextResponse.json(
                { success: false, error: `Description exceeds max limit of ${MAX_DESC_LENGTH} characters.` },
                { status: 400 }
            );
        }

        if (!submitted_by || typeof submitted_by !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Submitted_by identifier is required' },
                { status: 400 }
            );
        }

        if (!VALID_USER_REGEX.test(submitted_by)) {
            return NextResponse.json(
                { success: false, error: 'Invalid submitted_by format. Use alphanumeric characters only.' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('ComplaintTable')
            .insert({
                raw_text: trimmedText,
                submitted_by: submitted_by.trim()
            })
            .select('id, created_at')
            .single();

        if (error) {
            console.error('[DB Insert Error]:', error);
            return NextResponse.json(
                { success: false, error: 'Internal Server Error: Failed to log complaint.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Complaint submitted successfully',
                data: {
                    complaint_id: data.id,
                    created_at: data.created_at
                }
            },
            { status: 201 }
        );

    } catch (err) {
        console.error('[Unhandled API Error]:', err);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const ALLOWED_PARAMS = ['ward_no', 'status', 'problem_type', 'sort', 'user_id'];
        const providedParams = Array.from(searchParams.keys());

        const invalidParams = providedParams.filter(param => !ALLOWED_PARAMS.includes(param));

        if (invalidParams.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Invalid query parameter(s): ${invalidParams.join(', ')}. Allowed parameters: ${ALLOWED_PARAMS.join(', ')}`
                },
                { status: 400 }
            );
        }

        const wardNo = searchParams.get('ward_no');
        const status = searchParams.get('status');
        const problemType = searchParams.get('problem_type');
        const userId = searchParams.get('user_id');
        const sort = searchParams.get('sort') || 'newest';

        // Validate sort parameter
        const VALID_SORTS = ['newest', 'oldest'];
        if (!VALID_SORTS.includes(sort)) {
            return NextResponse.json(
                { success: false, error: `Invalid sort value. Allowed: ${VALID_SORTS.join(', ')}` },
                { status: 400 }
            );
        }

        let query = supabase
            .from('SummaryTable')
            .select('*');

        // Apply filters
        if (wardNo) {
            query = query.eq('ward_no', wardNo).not('ward_no', 'is', null);
        }

        if (userId) {
            query = query.eq('submitted_by', userId);
        }

        if (status) {
            query = query.eq('manager_workflow_status', status).not('manager_workflow_status', 'is', null);
        }

        if (problemType) {
            query = query.eq('problem_type', problemType).not('problem_type', 'is', null);
        }

        // Apply sorting
        if (sort === 'newest') {
            query = query.order('created_at', { ascending: false });
        } else if (sort === 'oldest') {
            query = query.order('created_at', { ascending: true });
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        // Map SummaryTable fields to frontend expected format
        const mappedData = data.map(item => ({
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
        console.error('[GET Complaints Error]:', err);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
