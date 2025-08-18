
'use server';

import fetch from 'node-fetch';

const PTERODACTYL_URL = process.env.PTERODACTYL_PANEL_URL;
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_API_KEY;

interface PteroUserAttributes {
    id: number;
    external_id: string | null;
    uuid: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    language: string;
    root_admin: boolean;
    '2fa': boolean;
    created_at: string;
    updated_at: string;
}

interface GetPteroUserInput {
    discordId: string;
}

/**
 * Finds a Pterodactyl user by their external ID (which should be their Discord ID).
 * This function assumes the user has already been created on the Pterodactyl panel
 * via a Discord SSO addon.
 * @param {GetPteroUserInput} input - The user's Discord ID.
 * @returns {Promise<PteroUserAttributes>} The Pterodactyl user object.
 * @throws Will throw an error if the user is not found.
 */
export async function getPterodactylUserByDiscordId(input: GetPteroUserInput): Promise<PteroUserAttributes> {
    if (!PTERODACTYL_URL || !PTERODACTYL_API_KEY) {
        throw new Error("Pterodactyl environment variables are not set.");
    }
    
    const { discordId } = input;

    try {
        const response = await fetch(`${PTERODACTYL_URL}/api/application/users/external/${discordId}`, {
            headers: {
                'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
                'Accept': 'application/json',
            },
        });

        if (response.ok) {
            const userData = await response.json();
            return userData.attributes;
        }

        if (response.status === 404) {
            throw new Error(`Pterodactyl user with Discord ID ${discordId} not found. The user may need to log into the panel first.`);
        }
        
        const errorBody = await response.text();
        throw new Error(`Failed to fetch Pterodactyl user. Status: ${response.status}, Body: ${errorBody}`);

    } catch (error) {
        console.error("Error fetching Pterodactyl user by external ID:", error);
        throw error;
    }
}
