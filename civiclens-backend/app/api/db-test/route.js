import { supabase } from '@/lib/supabase';

export async function GET() {
    const { data, error } = await supabase
        .from('ComplaintTable')
        .select('id')
        .limit(1);

    if (error) {
        return new Response(
            JSON.stringify({ ok: false, error: error.message }),
            { status: 500 }
        );
    }

    return new Response(
        JSON.stringify({ ok: true, rows: data }),
        { status: 200 }
    );
}
