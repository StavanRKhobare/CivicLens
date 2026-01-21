import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

        const { summary_id, verified } = body

        if (!summary_id || typeof summary_id !== 'number') {
            return NextResponse.json(
                { success: false, error: 'summary_id is required and must be a number' },
                { status: 400 }
            )
        }

        if (typeof verified !== 'boolean') {
            return NextResponse.json(
                { success: false, error: 'verified is required and must be a boolean' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('SummaryTable')
            .update({
                supervisor_verified: verified
            })
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
            message: 'Supervisor verification updated successfully',
            data: {
                summary_id: data.summaryId,
                supervisor_verified: data.supervisor_verified
            }
        })
    } catch (err) {
        console.error('[PATCH /supervisor-verify Error]:', err)
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
