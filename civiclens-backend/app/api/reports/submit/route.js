
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

// ------------------------------------------------------------------
// 1. HTML TEMPLATE (Body Only - Header/Footer moved to Puppeteer options)
// ------------------------------------------------------------------
const REPORT_BODY_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.4; color: #000; margin: 0; padding: 0; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 12pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 15px; }
        .field-row { margin-bottom: 8px; display: flex; }
        .field-label { font-weight: bold; width: 140px; flex-shrink: 0; }
        .field-value { flex-grow: 1; }
        .statement-box { border: 1px solid #000; padding: 15px; min-height: 100px; }
        .declaration { margin-top: 40px; border-top: 1px solid #000; padding-top: 15px; }
        .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80pt; color: rgba(0,0,0,0.05); z-index: -1; white-space: nowrap; }
        .meta-info { font-family: 'Courier New', monospace; font-size: 10pt; margin-bottom: 30px; }
    </style>
</head>
<body>
    <div class="watermark">OFFICIAL RECORD</div>

    <!-- Meta Info Block (Page 1 Only Context) -->
    <div class="meta-info">
        <div><strong>SUBJECT:</strong> WARD RESOLUTION REPORT</div>
        <div><strong>SUMMARY ID:</strong> {{SUMMARY_ID}}</div>
    </div>

    <!-- 2. ISSUE SUMMARY SECTION (SYSTEM GENERATED) -->
    <div class="section">
        <div class="section-title">Issue Summary (System Generated)</div>
        <div class="field-row"><span class="field-label">Ward:</span><span class="field-value">{{WARD_NO}}</span></div>
        <div class="field-row"><span class="field-label">Problem Type:</span><span class="field-value">{{PROBLEM_TYPE}}</span></div>
        <div class="field-row"><span class="field-label">Date Reported:</span><span class="field-value">{{DATE_REPORTED}}</span></div>
        <div class="field-row"><span class="field-label">Source:</span><span class="field-value">Official CivicLens Portal</span></div>
        <div style="margin-top: 15px;">
            <div class="field-label">Summary Text:</div>
            <div class="statement-box" style="margin-top: 5px; min-height: 60px; background: #f9f9f9;">{{SUMMARY_TEXT}}</div>
        </div>
    </div>

    <!-- 3. MANAGER RESOLUTION STATEMENT -->
    <div class="section">
        <div class="section-title">Manager Resolution Statement</div>
        <div class="field-row"><span class="field-label">Final Status:</span><span class="field-value">RESOLVED</span></div>
        <div class="field-row"><span class="field-label">Manager Name:</span><span class="field-value">{{MANAGER_NAME}}</span></div>
        <div class="field-row"><span class="field-label">Resolution Time:</span><span class="field-value">{{RESOLUTION_TIMESTAMP}}</span></div>
        <div style="margin-top: 15px;">
            <div class="field-label">Manager Remarks:</div>
            <div class="statement-box">{{MANAGER_REMARKS}}</div>
        </div>
    </div>

    <!-- 4. MANAGER DECLARATION -->
    <div class="declaration">
        <p>I, <strong>Ward {{WARD_NO}} Manager</strong>, hereby declare under penalty of administrative action that the above issue has been successfully resolved in accordance with civic governance standards. I certify that the remarks provided above are true and accurate.</p>
        
        <div style="margin-top: 40px; display: flex; justify-content: space-between;">
            <div>
                <div style="border-top: 1px solid #000; width: 200px; padding-top: 5px;">Signed (Electronic)</div>
                <div style="font-family: 'Courier New', monospace; font-size: 8pt;">{{SIGNATURE_TIMESTAMP}}</div>
            </div>
            <div style="text-align: right;">
                <div><strong>Manager Ward No. {{WARD_NO}}</strong></div>
                <div>Ward Manager, Annual Contract</div>
            </div>
        </div>
    </div>
</body>
</html>
`;

// ------------------------------------------------------------------
// 2. PUPPETEER PDF GENERATION LOGIC
// ------------------------------------------------------------------
import fs from 'fs';
import path from 'path';

// ... (previous code)

async function generatePDF(data) {
    // Fill Body
    let filledBody = REPORT_BODY_TEMPLATE
        .replace(/{{SUMMARY_ID}}/g, data.summaryId)
        .replace(/{{WARD_NO}}/g, data.wardNo)
        .replace(/{{PROBLEM_TYPE}}/g, data.problemType)
        .replace(/{{DATE_REPORTED}}/g, new Date(data.dateReported).toLocaleDateString())
        .replace(/{{SUMMARY_TEXT}}/g, data.summaryText)
        .replace(/{{MANAGER_NAME}}/g, data.managerName)
        .replace(/{{RESOLUTION_TIMESTAMP}}/g, new Date().toISOString())
        .replace(/{{MANAGER_REMARKS}}/g, data.managerRemarks)
        .replace(/{{SIGNATURE_TIMESTAMP}}/g, new Date().toISOString());

    // Read Logo File
    // Note: Adjust path as needed based on deployment structure. For local dev:
    const logoPath = 'C:\\Users\\rohit\\OneDrive\\Desktop\\Main EL\\civiclens\\civiclens-frontend\\public\\logo.jpeg';
    let logoBase64 = '';
    try {
        const logoBuffer = fs.readFileSync(logoPath);
        logoBase64 = `data:image/jpeg;base64,${logoBuffer.toString('base64')}`;
    } catch (err) {
        console.error('Failed to load logo image:', err);
        // Fallback or empty if not found
    }

    // Header Template
    const headerTemplate = `
        <div style="font-size: 10px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0 20mm 0 20mm; border-bottom: 2px solid black; box-sizing: border-box;">
            <div style="display: flex; align-items: center;">
                <!-- Logo: Embedded Base64 Image -->
                ${logoBase64 ? `<img src="${logoBase64}" width="40" height="40" style="margin-right: 15px; border-radius: 50%;" />` : ''}
                <div style="font-family: 'Times New Roman', serif; font-size: 18pt; font-weight: bold; letter-spacing: 1px;">CIVICLENS</div>
            </div>
            <div style="font-family: 'Courier New', monospace; font-size: 8pt; text-align: right; line-height: 1.2;">
                <div>REPORT ID: ${data.reportId}</div>
                <div>GENERATED: ${new Date().toISOString().split('T')[0]}</div>
            </div>
        </div>
    `;

    // Footer Template (Repeating on every page)
    const footerTemplate = `
        <div style="font-size: 8pt; width: 100%; display: flex; justify-content: center; padding-top: 5px; border-top: 1px solid black; font-family: 'Courier New', monospace; margin: 0 20mm;">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span> • Generated by CivicLens Governance Platform
        </div>
    `;

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.setContent(filledBody, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: headerTemplate,
        footerTemplate: footerTemplate,
        margin: {
            top: '45mm',    // Increased margin
            bottom: '20mm', // Space for Footer
            left: '20mm',
            right: '20mm'
        }
    });

    await browser.close();
    return pdfBuffer;
}

// ------------------------------------------------------------------
// 3. SHA-256 HASHING LOGIC
// ------------------------------------------------------------------
function computePDFHash(pdfBuffer) {
    return crypto.createHash('sha256').update(pdfBuffer).digest('hex');
}


// ------------------------------------------------------------------
// 4. API ENDPOINT LOGIC
// ------------------------------------------------------------------
export async function POST(request) {
    try {
        const body = await request.json();
        const { complaintId } = body;

        // --- VALIDATION START ---
        if (!complaintId) {
            return NextResponse.json({ success: false, error: 'Complaint ID required' }, { status: 400 });
        }

        // Parse ID (c{ward}-{summaryId})
        const idParts = complaintId.substring(1).split('-');
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

        // Rule: PDF allowed ONLY if status = RESOLVED
        if (complaint.manager_workflow_status !== 'Resolved') {
            return NextResponse.json({ success: false, error: 'Report generation only allowed for RESOLVED complaints.' }, { status: 403 });
        }

        // Rule: Manager remarks are mandatory
        if (!complaint.managerRemarks || !complaint.managerRemarks.trim()) {
            return NextResponse.json({ success: false, error: 'Manager remarks are mandatory for report generation.' }, { status: 400 });
        }
        // --- VALIDATION END ---


        // Prepare Data for Template
        const reportData = {
            reportId: crypto.randomUUID(),
            summaryId: complaint.summaryId,
            wardNo: complaint.ward_no,
            problemType: complaint.problem_type || 'General',
            dateReported: complaint.created_at,
            summaryText: complaint.summary,
            managerName: `Ward ${complaint.ward_no} Manager`, // In real app, fetch from auth/users table
            managerRemarks: complaint.managerRemarks
        };

        // GENERATE PDF
        const pdfBuffer = await generatePDF(reportData);

        // COMPUTE HASH
        const pdfHash = computePDFHash(pdfBuffer);
        console.log('[Debug] Generated PDF Hash:', pdfHash);

        // UPLOAD TO STORAGE (Bucket: manager_pdfs)
        const fileName = `${wardNo}_${summaryId}_${reportData.reportId}.pdf`;
        const { error: uploadError } = await supabase.storage
            .from('manager_pdfs')
            .upload(fileName, pdfBuffer, {
                contentType: 'application/pdf',
                upsert: true
            });

        if (uploadError) {
            console.error('[Debug] Storage Upload Failed:', uploadError);
            return NextResponse.json({ success: false, error: 'Failed to upload report to storage. ' + uploadError.message }, { status: 500 });
        }

        // GET PUBLIC URL
        const { data: { publicUrl } } = supabase.storage
            .from('manager_pdfs')
            .getPublicUrl(fileName);

        // Update DB
        const { data: updatedData, error: updateError } = await supabase
            .from('SummaryTable')
            .update({
                pdfPath: publicUrl,
                pdfHash: pdfHash
            })
            .eq('ward_no', wardNo)
            .eq('summaryId', summaryId)
            .select();

        if (updateError) {
            console.error('Failed to update metadata:', updateError);
            return NextResponse.json({
                success: false,
                error: `Failed to record report generation. DB Error: ${updateError.message || updateError.details || 'Unknown DB error'}`
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Report generated successfully',
            reportId: reportData.reportId,
            pdfHash: pdfHash
        });

    } catch (err) {
        console.error('[PDF Generation Error]:', err);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
