
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
    email: string;
    name: string;
}

/**
 * Finds a Pterodactyl user by their external ID (Discord ID) or creates one if not found.
 * This is the preferred method for syncing users.
 * @param {GetPteroUserInput} input - The user's information.
 * @returns {Promise<PteroUserAttributes>} The Pterodactyl user object.
 */
export async function getOrCreatePterodactylUser(input: GetPteroUserInput): Promise<PteroUserAttributes> {
    if (!PTERODACTYL_URL || !PTERODACTYL_API_KEY) {
        throw new Error("Pterodactyl environment variables are not set.");
    }
    
    const { discordId, email, name } = input;
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    try {
        // 1. Try to fetch the user by their external_id (Discord ID)
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

        // If user is not found (404), we'll proceed to create them.
        if (response.status !== 404) {
            const errorBody = await response.text();
            throw new Error(`Failed to fetch Pterodactyl user. Status: ${response.status}, Body: ${errorBody}`);
        }

    } catch (error: any) {
         if (error.response?.status !== 404) {
            console.error("Error fetching Pterodactyl user by external ID:", error);
            throw error;
         }
         // if 404, we continue to creation
    }


    // 2. If not found, create the user
    console.log(`User with Discord ID ${discordId} not found. Creating new Pterodactyl user.`);
    try {
        const createResponse = await fetch(`${PTERODA_PANEL_URL}/api/application/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                external_id: discordId,
                email: email,
                username: name.replace(/\s+/g, '_') + `_${discordId.slice(-4)}`, // Ensure username is unique
                first_name: firstName,
                last_name: lastName,
                password: null, // Let the panel handle password creation/invites
            }),
        });

        if (!createResponse.ok) {
             const errorBody = await createResponse.text();
             throw new Error(`Failed to create Pterodactyl user. Status: ${createResponse.status}, Body: ${errorBody}`);
        }

        const newUser = await createResponse.json();
        return newUser.attributes;

    } catch (error) {
        console.error("Error creating Pterodactyl user:", error);
        throw error;
    }
}
