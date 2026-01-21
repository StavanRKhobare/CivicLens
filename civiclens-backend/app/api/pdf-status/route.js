import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const ALLOWED_PDF_STATUSES = ['Not Generated', 'Generated', 'Submitted', 'Failed']

export async function PATCH(request) {
    try {
        const contentType = request.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            return NextResponse.json(
                { success: false, error: 'Invalid Content-Type. Expected application/json' },
                { status: 415 }
            )
        }

        let body
        try {
            body = await request.json()
        } catch (e) {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON body' },
                { status: 400 }
            )
        }

        const { summary_id, pdfStatus, pdfPath } = body

        if (!summary_id || typeof summary_id !== 'number') {
            return NextResponse.json(
                { success: false, error: 'summary_id is required and must be a number' },
                { status: 400 }
            )
        }

        if (!pdfStatus || typeof pdfStatus !== 'string') {
            return NextResponse.json(
                { success: false, error: 'pdfStatus is required and must be a string' },
                { status: 400 }
            )
        }

        if (!ALLOWED_PDF_STATUSES.includes(pdfStatus)) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Invalid pdfStatus value. Allowed values: ${ALLOWED_PDF_STATUSES.join(', ')}`
                },
                { status: 400 }
            )
        }

        if (pdfPath !== undefined && pdfPath !== null && typeof pdfPath !== 'string') {
            return NextResponse.json(
                { success: false, error: 'pdfPath must be a string if provided' },
                { status: 400 }
            )
        }

        const updateData = {
            pdfStatus
        }

        if (pdfPath !== undefined && pdfPath !== null && pdfPath.trim() !== '') {
            updateData.pdfPath = pdfPath.trim()
        }

        const { data, error } = await supabase
            .from('SummaryTable')
            .update(updateData)
            .eq('summaryId', summary_id)
            .select()
            .single()

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            )
        }

        if (!data) {
            return NextResponse.json(
                { success: false, error: 'Summary not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'PDF status updated successfully',
            data: {
                summary_id: data.summaryId,
                pdfStatus: data.pdfStatus,
                pdfPath: data.pdfPath
            }
        })
    } catch (err) {
        console.error('[PATCH /pdf-status Error]:', err)
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
