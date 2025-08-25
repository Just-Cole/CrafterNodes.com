
'use server';

import { randomBytes } from 'crypto';
import mysql from 'mysql2/promise';

const PTERODACTYL_URL = process.env.PTERODACTYL_PANEL_URL;
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_API_KEY;
const DATABASE_URL = "mysql://crafteruser:%23Tjc52302@172.93.108.112:3306/crafternodes";


if (!PTERODACTYL_URL || !PTERODACTYL_API_KEY) {
    throw new Error("Pterodactyl environment variables are not set.");
}

async function getDbConnection() {
    if (!DATABASE_URL) {
        throw new Error('DATABASE_URL is not set.');
    }
    return mysql.createConnection(DATABASE_URL);
}

// A generic fetch wrapper for Pterodactyl API
async function pteroRequest(endpoint: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET', body?: object) {
    const url = `${PTERODACTYL_URL}/api/application${endpoint}`;
    const options: RequestInit = {
        method,
        headers: {
            'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        // Don't cache API requests
        cache: 'no-store'
    };

    if (body) {
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);

    // For 204 No Content responses (like on successful delete)
    if (response.status === 204) {
        return null;
    }

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
        const errorMessages = responseData.errors?.map((e: any) => e.detail).join(', ') || response.statusText;
        console.error(`Pterodactyl API Error (${response.status}): ${errorMessages}`, { url, body, responseData });
        // Specifically check for 404 to handle "not found" cases gracefully
        if (response.status === 404) {
             const notFoundError = new Error(`Pterodactyl resource not found: ${errorMessages}`);
             (notFoundError as any).status = 404;
             throw notFoundError;
        }
        throw new Error(`Pterodactyl API Error: ${errorMessages}`);
    }
    
    return responseData;
}


interface PteroUserInput {
  discordId: string;
  email: string;
  name: string;
  password?: string;
}

// This function specifically checks our local DB if a user is linked to a Pterodactyl ID.
export async function checkIfPterodactylUserExists(discordId: string): Promise<boolean> {
    const connection = await getDbConnection();
    try {
        const [rows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT pterodactylId FROM users WHERE discordId = ?',
            [discordId]
        );
        // A user exists and is linked if we have a row and the pterodactylId is not null.
        return rows.length > 0 && !!rows[0].pterodactylId;
    } catch (error) {
        console.error("Failed to check for user in DB:", error);
        return false;
    } finally {
        await connection.end();
    }
}

async function createNewPterodactylUser(input: PteroUserInput, connection: mysql.Connection) {
    console.log(`No Pterodactyl user found for Discord ID ${input.discordId}. Creating a new one.`);
    const { name, email, discordId } = input;
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;
    
    // In the explicit setup flow, a password MUST be provided.
    if (!input.password) {
        throw new Error("Password is required to create a new Pterodactyl user.");
    }

    const newUserPayload = {
        external_id: discordId,
        email: email,
        username: discordId, // Use Discord ID for a guaranteed unique username
        first_name: firstName,
        last_name: lastName,
        password: input.password,
    };

    const newPteroUser = await pteroRequest('/users', 'POST', newUserPayload);
    console.log(`Successfully created Pterodactyl user ${newPteroUser.attributes.id} for Discord user ${discordId}`);

    // Update our local DB to link the accounts
    await connection.execute(
        `UPDATE users SET pterodactylId = ? WHERE discordId = ?`,
        [newPteroUser.attributes.id, discordId]
    );
    console.log(`Successfully linked Pterodactyl ID ${newPteroUser.attributes.id} to local user with Discord ID ${discordId}`);

    return newPteroUser;
}


export async function getOrCreatePterodactylUser(input: PteroUserInput) {
    const connection = await getDbConnection();
    try {
        // 1. Check our local database for the user and their Pterodactyl ID
        const [userRows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT pterodactylId FROM users WHERE discordId = ?',
            [input.discordId]
        );

        // 2. If user exists in our DB and has a Pterodactyl ID, verify it exists in Pterodactyl
        if (userRows.length > 0 && userRows[0].pterodactylId) {
            console.log(`User found in DB with Ptero ID: ${userRows[0].pterodactylId}. Verifying...`);
            try {
                const pteroUser = await pteroRequest(`/users/${userRows[0].pterodactylId}`);
                console.log(`Pterodactyl user ${pteroUser.attributes.id} verified.`);
                return pteroUser;
            } catch (error: any) {
                if (error.status === 404) {
                    console.warn(`User ${userRows[0].pterodactylId} not found in Pterodactyl, despite being in DB. A new one must be created.`);
                    // Fall through to the creation logic.
                } else {
                    // For other errors, we re-throw.
                    throw error;
                }
            }
        }
        
        // 3. If we're here, the user either isn't linked or the linked account is gone.
        // We will create a new Pterodactyl user. This now expects a password.
        return await createNewPterodactylUser(input, connection);

    } catch (error) {
        console.error('Failed to get or create Pterodactyl user:', error);
        // Ensure any error is re-thrown so it can be handled by the calling action.
        throw error;
    } finally {
        await connection.end();
    }
}


export async function createPterodactylServer(serverConfig: any) {
    try {
        const response = await pteroRequest('/servers', 'POST', serverConfig);
        return response.attributes;
    } catch (error) {
        console.error('Failed to create Pterodactyl server:', error);
        throw error;
    }
}
