
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
  externalId: string; // Generic external ID, was previously discordId
  email: string;
  name: string;
  password?: string;
}

export async function checkIfPterodactylUserExists(externalId: string): Promise<boolean> {
    const connection = await getDbConnection();
    try {
        const [rows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT pterodactylId FROM users WHERE externalId = ?', // Using generic externalId
            [externalId]
        );
        return rows.length > 0 && !!rows[0].pterodactylId;
    } catch (error) {
        console.error("Failed to check for user in DB:", error);
        return false;
    } finally {
        await connection.end();
    }
}

export async function getOrCreatePterodactylUser(input: PteroUserInput) {
    const connection = await getDbConnection();
    try {
        // 1. Check our database first
        const [userRows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT id, pterodactylId FROM users WHERE externalId = ?',
            [input.externalId]
        );
        if (userRows.length > 0 && userRows[0].pterodactylId) {
            console.log(`User found in DB with Ptero ID: ${userRows[0].pterodactylId}. Verifying...`);
            try {
                // Verify user still exists in Pterodactyl
                return await pteroRequest(`/users/${userRows[0].pterodactylId}`);
            } catch (error: any) {
                 if (error.status === 404) {
                    console.warn(`User ${userRows[0].pterodactylId} not found in Pterodactyl, despite being in DB. Will create a new one.`);
                    // Fall through to create a new user
                } else {
                    throw error; // Re-throw other errors
                }
            }
        }

        // 2. If not in DB or Ptero user was deleted, check Pterodactyl by external_id
        console.log(`Checking Pterodactyl for user with external_id: ${input.externalId}`);
        const existingUsers = await pteroRequest(`/users/external/${input.externalId}`);
        
        console.log(`Found existing user in Pterodactyl: ${existingUsers.attributes.id}`);
        // If found, update our database with the correct Pterodactyl ID
        await connection.execute(
            'UPDATE users SET pterodactylId = ? WHERE externalId = ?',
            [existingUsers.attributes.id, input.externalId]
        );
        return existingUsers;

    } catch (error: any) {
        if (error.status === 404) {
             // 3. If not found anywhere, create a new user
            console.log(`No Pterodactyl user found for external ID ${input.externalId}. Creating a new one.`);
            const { name, email, externalId } = input;
            const [firstName, ...lastNameParts] = name.split(' ');
            const lastName = lastNameParts.join(' ') || firstName;
            // Pterodactyl requires a password for user creation via API
            const password = input.password || randomBytes(16).toString('hex');
            
            const newUserPayload = {
                external_id: externalId,
                email: email,
                username: externalId, // Use a guaranteed unique value for username
                first_name: firstName,
                last_name: lastName,
                password: password,
            };
            
            const newPteroUser = await pteroRequest('/users', 'POST', newUserPayload);
            console.log(`Successfully created Pterodactyl user ${newPteroUser.attributes.id} for external user ${externalId}`);

            await connection.execute(
                `INSERT INTO users (externalId, pterodactylId, email, name)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE pterodactylId = VALUES(pterodactylId), email = VALUES(email), name = VALUES(name)`,
                [externalId, newPteroUser.attributes.id, email, name]
            );
            console.log(`Successfully created/updated database user record for external ID ${externalId}`);

            return newPteroUser;
        } else {
            console.error('Failed to get or create Pterodactyl user:', error);
            throw error;
        }
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
