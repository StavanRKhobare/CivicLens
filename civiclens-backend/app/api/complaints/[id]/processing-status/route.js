import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { id } = params;
        
        if (!id) {
            return NextResponse.json({ success: false, error: 'Complaint ID is required' }, { status: 400 });
        }
        
        const mlUrl = process.env.ML_PIPELINE_URL || 'http://localhost:8000';
        const response = await fetch(`${mlUrl}/status/${id}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json({ success: false, error: 'Complaint not found' }, { status: 404 });
            }
            throw new Error(`ML Pipeline returned status ${response.status}`);
        }
        
        const data = await response.json();
        
        return NextResponse.json({
            success: true,
            data: data
        });
        
    } catch (err) {
        console.error('[Processing Status API Error]:', err);
        return NextResponse.json(
            { success: false, error: 'Failed to retrieve processing status' },
            { status: 500 }
        );
    }
}
