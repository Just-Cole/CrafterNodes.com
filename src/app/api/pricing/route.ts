
import { getPricingData } from '@/lib/pricing';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const data = await getPricingData();
        return NextResponse.json(data);
    } catch (error) {
        console.error("API Error fetching pricing data:", error);
        return NextResponse.json({ error: 'Failed to fetch pricing data' }, { status: 500 });
    }
}
