import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ success: false, error: 'Complaint ID required' }, { status: 400 });
        }

        // Parse ID (c{ward}-{summaryId})
        const idParts = id.substring(1).split('-');
        if (idParts.length !== 2) return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
        const wardNo = parseInt(idParts[0]);
        const summaryId = parseInt(idParts[1]);

        // Fetch Complaint Data
        const { data: complaint, error } = await supabase
            .from('SummaryTable')
            .select('*')
            .eq('ward_no', wardNo)
            .eq('summaryId', summaryId)
            .single();

        if (error || !complaint) {
            return NextResponse.json({ success: false, error: 'Complaint not found' }, { status: 404 });
        }

        if (!complaint.pdfPath) {
            return NextResponse.json({ success: false, error: 'Report not yet generated' }, { status: 404 });
        }

        // Fetch PDF from Storage url
        const pdfResp = await fetch(complaint.pdfPath);
        if (!pdfResp.ok) {
            return NextResponse.json({ success: false, error: 'Failed to fetch PDF from storage' }, { status: 500 });
        }
        const pdfBuffer = await pdfResp.arrayBuffer();

        // Return PDF
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="report-${id}.pdf"`,
            },
        });

    } catch (err) {
        console.error('[PDF Download Error]:', err);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
