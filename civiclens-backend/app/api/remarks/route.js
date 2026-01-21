import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const ALLOWED_MANAGER_STATUSES = ['Drafted', 'Submitted', 'Returned', 'Verified']

export async function POST(request) {
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

        const { summary_id, managerRemarks, managerStatus } = body

        if (!summary_id || typeof summary_id !== 'number') {
            return NextResponse.json(
                { success: false, error: 'summary_id is required and must be a number' },
                { status: 400 }
            )
        }

        if (!managerStatus || typeof managerStatus !== 'string') {
            return NextResponse.json(
                { success: false, error: 'managerStatus is required and must be a string' },
                { status: 400 }
            )
        }

        if (!ALLOWED_MANAGER_STATUSES.includes(managerStatus)) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Invalid managerStatus value. Allowed values: ${ALLOWED_MANAGER_STATUSES.join(', ')}`
                },
                { status: 400 }
            )
        }

        if (managerRemarks !== undefined && typeof managerRemarks !== 'string') {
            return NextResponse.json(
                { success: false, error: 'managerRemarks must be a string if provided' },
                { status: 400 }
            )
        }

        const updateData = {
            managerStatus
        }

        if (managerRemarks !== undefined && managerRemarks.trim() !== '') {
            updateData.managerRemarks = managerRemarks.trim()
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
            message: 'Manager remarks updated successfully',
            data: {
                summary_id: data.summaryId,
                managerStatus: data.managerStatus
            }
        })
    } catch (err) {
        console.error('[POST /remarks Error]:', err)
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)

        const ALLOWED_PARAMS = ['summary_id']
        const providedParams = Array.from(searchParams.keys())

        const invalidParams = providedParams.filter(param => !ALLOWED_PARAMS.includes(param))

        if (invalidParams.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Invalid query parameter(s): ${invalidParams.join(', ')}. Allowed parameters: ${ALLOWED_PARAMS.join(', ')}`
                },
                { status: 400 }
            )
        }

        const summary_id = searchParams.get('summary_id')

        if (!summary_id) {
            return NextResponse.json(
                { success: false, error: 'summary_id query parameter is required' },
                { status: 400 }
            )
        }

        const summaryIdNum = parseInt(summary_id)
        if (isNaN(summaryIdNum)) {
            return NextResponse.json(
                { success: false, error: 'summary_id must be a valid number' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('SummaryTable')
            .select('managerRemarks, managerStatus')
            .eq('summaryId', summaryIdNum)
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
            data: {
                managerRemarks: data.managerRemarks,
                managerStatus: data.managerStatus
            }
        })
    } catch (err) {
        console.error('[GET /remarks Error]:', err)
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}

