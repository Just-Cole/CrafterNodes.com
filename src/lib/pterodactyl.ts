
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
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Catch if error response is not json
        const errorMessages = errorData.errors?.map((e: any) => e.detail).join(', ') || response.statusText;
        console.error(`Pterodactyl API Error (${response.status}): ${errorMessages}`, { url, body, errorData });
        throw new Error(`Pterodactyl API Error: ${errorMessages}`);
    }
    
    // For 204 No Content responses
    if (response.status === 204) {
        return null;
    }

    return response.json();
}


interface PteroUserInput {
  discordId: string;
  email: string;
  name: string;
  password?: string;
}

export async function checkIfPterodactylUserExists(discordId: string): Promise<boolean> {
    const connection = await getDbConnection();
    try {
        const [rows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT pterodactylId FROM users WHERE discordId = ?',
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

export async function getOrCreatePterodactylUser(input: PteroUserInput) {
    const connection = await getDbConnection();
    try {
        const [userRows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT id, pterodactylId FROM users WHERE discordId = ?',
            [input.discordId]
        );
        if (userRows.length > 0 && userRows[0].pterodactylId) {
            return await pteroRequest(`/users/${userRows[0].pterodactylId}`);
        }

        // Check if user exists by external ID
        const existingUsers = await pteroRequest(`/users?filter[external_id]=${input.discordId}`);
        if (existingUsers.data.length > 0) {
            const pteroUser = existingUsers.data[0];
            await connection.execute(
                'UPDATE users SET pterodactylId = ? WHERE discordId = ?',
                [pteroUser.attributes.id, input.discordId]
            );
            return pteroUser;
        }
        
        // If no user found, create a new one
        console.log(`No Pterodactyl user found for Discord ID ${input.discordId}. Creating a new one.`);
        const { name, email, discordId } = input;
        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ') || firstName;
        const password = input.password || randomBytes(16).toString('hex');
        
        const newUserPayload = {
            external_id: discordId,
            email: email,
            username: name.replace(/\s+/g, '_') + `_${discordId.slice(-4)}`,
            first_name: firstName,
            last_name: lastName,
            password: password,
            root_admin: false,
        };
        
        const newPteroUser = await pteroRequest('/users/', 'POST', newUserPayload);
        console.log(`Successfully created Pterodactyl user ${newPteroUser.attributes.id} for Discord user ${discordId}`);

        await connection.execute(
            `INSERT INTO users (discordId, pterodactylId, email, name)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE pterodactylId = VALUES(pterodactylId), email = VALUES(email), name = VALUES(name)`,
            [discordId, newPteroUser.attributes.id, email, name]
        );
        console.log(`Successfully created/updated database user record for Discord ID ${discordId}`);

        return newPteroUser;

    } catch (error) {
        console.error('Failed to create or link Pterodactyl user:', error);
        throw error; // Re-throw the error to be handled by the caller
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
