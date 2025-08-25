
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const PTERODACTYL_URL = process.env.PTERODACTYL_PANEL_URL;
// NOTE: This uses the CLIENT API KEY, not the application key
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_CLIENT_API_KEY;


export async function GET(request: NextRequest, { params }: { params: { serverId: string } }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!PTERODACTYL_URL || !PTERODACTYL_API_KEY) {
        return NextResponse.json({ error: "Pterodactyl client API environment variables are not set." }, { status: 500 });
    }

    const { serverId } = params;

    try {
        const pteroResponse = await fetch(`${PTERODACTYL_URL}/api/client/servers/${serverId}/websocket`, {
            headers: {
                'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
                'Accept': 'application/json',
            },
            cache: 'no-store', // Always fetch a fresh token
        });

        if (!pteroResponse.ok) {
            const errorData = await pteroResponse.json().catch(() => ({ detail: pteroResponse.statusText }));
             console.error("Pterodactyl WS Token Error:", errorData);
            return NextResponse.json({ error: `Failed to get websocket credentials from Pterodactyl: ${errorData.errors?.[0]?.detail || 'Unknown error'}` }, { status: pteroResponse.status });
        }

        const data = await pteroResponse.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Internal error fetching ws-token: ", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
