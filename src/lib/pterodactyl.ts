
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

    // Handle non-OK responses that might not be JSON
    if (!response.ok) {
        const errorText = await response.text();
        let errorMessages = response.statusText;
        try {
            const responseData = JSON.parse(errorText);
            errorMessages = responseData.errors?.map((e: any) => e.detail).join(', ') || errorMessages;
        } catch (e) {
            // The error response wasn't JSON. Use the raw text.
            errorMessages = errorText || errorMessages;
        }

        console.error(`Pterodactyl API Error (${response.status}): ${errorMessages}`, { url, body });
        
        const error = new Error(`Pterodactyl API Error: ${errorMessages}`);
        (error as any).status = response.status;
        throw error;
    }
    
    // If response is OK, it should be JSON.
    return response.json();
}


interface PteroUserInput {
  discordId: string;
  email: string;
  name: string;
}

export async function checkIfPterodactylUserExists(discordId: string): Promise<boolean> {
    const connection = await getDbConnection();
    try {
        const [rows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT pterodactylId FROM users WHERE externalId = ?',
            [discordId]
        );
        return rows.length > 0 && !!rows[0].pterodactylId;
    } catch (error) {
        console.error("Failed to check for user in DB:", error);
        return false;
    } finally {
        await connection.end();
    }
}

async function createNewPterodactylUser(input: PteroUserInput) {
    console.log(`No Pterodactyl user found for Discord ID ${input.discordId}. Creating a new one.`);
    const { name, email, discordId } = input;
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;
    
    const newUserPayload = {
        external_id: discordId,
        email: email,
        username: discordId, // Use Discord ID for a guaranteed unique username
        first_name: firstName,
        last_name: lastName,
        password: randomBytes(16).toString('hex'), // Generate a secure random password
    };
    
    const newPteroUser = await pteroRequest('/users', 'POST', newUserPayload);
    console.log(`Successfully created Pterodactyl user ${newPteroUser.attributes.id} for Discord user ${discordId}`);

    const connection = await getDbConnection();
    try {
        await connection.execute(
            `INSERT INTO users (externalId, pterodactylId, email, name)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE pterodactylId = VALUES(pterodactylId), email = VALUES(email), name = VALUES(name)`,
            [discordId, newPteroUser.attributes.id, email, name]
        );
        console.log(`Successfully created/updated database user record for Discord ID ${discordId}`);
    } finally {
        await connection.end();
    }

    return newPteroUser;
}

export async function getOrCreatePterodactylUser(input: PteroUserInput) {
    const connection = await getDbConnection();
    try {
        // 1. Check our database first
        const [userRows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT id, pterodactylId FROM users WHERE externalId = ?',
            [input.discordId]
        );
        
        if (userRows.length > 0 && userRows[0].pterodactylId) {
            const pteroId = userRows[0].pterodactylId;
            console.log(`User found in DB with Ptero ID: ${pteroId}. Verifying...`);
            try {
                // Verify user still exists in Pterodactyl
                const pteroUser = await pteroRequest(`/users/${pteroId}`);
                console.log(`Pterodactyl user ${pteroId} verified.`);
                return pteroUser;
            } catch (error: any) {
                 if (error.status === 404) {
                    console.warn(`User ${pteroId} not found in Pterodactyl, despite being in DB. Will create a new one.`);
                    // Fall through to create a new user by returning from the function
                    return await createNewPterodactylUser(input);
                }
                // Re-throw other errors
                throw error; 
            }
        }

        // 2. If not in our DB, check Pterodactyl by external_id in case it was created manually or by another process
        try {
            console.log(`Checking Pterodactyl for user with external_id: ${input.discordId}`);
            const existingUser = await pteroRequest(`/users/external/${input.discordId}`);
            console.log(`Found existing user in Pterodactyl: ${existingUser.attributes.id}`);

            // If found, create or update our database record with the correct Pterodactyl ID
            await connection.execute(
                `INSERT INTO users (externalId, pterodactylId, email, name)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE pterodactylId = VALUES(pterodactylId), email = VALUES(email), name = VALUES(name)`,
                [input.discordId, existingUser.attributes.id, input.email, input.name]
            );
            return existingUser;
        } catch (error: any) {
             if (error.status === 404) {
                // 3. If not found anywhere, create a new user. This is the expected "happy path" for a new user.
                return await createNewPterodactylUser(input);
            }
            // Re-throw other unexpected errors from the external_id check
            throw error;
        }

    } catch (error) {
        console.error('Failed to get or create Pterodactyl user:', error);
        throw error; // Propagate the error up
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
