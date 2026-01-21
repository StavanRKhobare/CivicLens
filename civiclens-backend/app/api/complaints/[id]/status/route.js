import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const ALLOWED_STATUSES = ['Pending', 'In Progress', 'Resolved']

export async function PATCH(request, { params }) {
    try {
        const { id } = await params

        // Format validation: c{ward_no}-{summaryId}
        if (!id || !id.startsWith('c') || !id.includes('-')) {
            return NextResponse.json(
                { success: false, error: 'Invalid complaint ID format' },
                { status: 400 }
            )
        }

        const idParts = id.substring(1).split('-');
        if (idParts.length !== 2) {
            return NextResponse.json(
                { success: false, error: 'Invalid complaint ID format' },
                { status: 400 }
            )
        }

        const wardNo = parseInt(idParts[0]);
        const summaryId = parseInt(idParts[1]);

        if (isNaN(wardNo) || isNaN(summaryId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid ward number or summary ID' },
                { status: 400 }
            )
        }

        const body = await request.json()
        const { status, remarks } = body

        if (!status || typeof status !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Status is required and must be a string' },
                { status: 400 }
            )
        }

        if (!ALLOWED_STATUSES.includes(status)) {
            return NextResponse.json(
                { success: false, error: `Invalid status value. Allowed values: ${ALLOWED_STATUSES.join(', ')}` },
                { status: 400 }
            )
        }

        // Prepare update object
        const updateData = {
            manager_workflow_status: status
        }

        if (remarks) {
            updateData.managerRemarks = remarks;
        }

        const { data, error } = await supabase
            .from('SummaryTable')
            .update(updateData)
            .eq('ward_no', wardNo)
            .eq('summaryId', summaryId)
            .select()
            .single()

        if (error) {
            console.error('[Update Status Error]:', error)
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            )
        }

        // Even if no rows returned (maybe just updated), checking for error covers most cases. 
        // Note: .single() will error if no rows matched, effectively handling 404.

        return NextResponse.json({
            success: true,
            message: 'Complaint status updated successfully',
            data: {
                id: id,
                status: status,
                remarks: remarks || data?.managerRemarks // Return updated or existing remarks
            }
        })
    } catch (err) {
        console.error('[PATCH /complaints/[id]/status Error]:', err)
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
