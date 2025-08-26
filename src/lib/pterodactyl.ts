
'use server';

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

// A generic fetch wrapper for Pterodactyl API, modeled after the provided documentation example.
async function pteroRequest(endpoint: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET', body?: object) {
    const url = `${PTERODACTYL_URL}/api/application${endpoint}`;
    
    const headers = {
        'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
        'Accept': 'Application/vnd.pterodactyl.v1+json',
        'Content-Type': 'application/json',
    };

    const options: RequestInit = {
        method,
        headers,
        cache: 'no-store'
    };

    if (body) {
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);

    if (response.status === 204) {
        return null; // For successful DELETE requests
    }

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
        const errorMessages = responseData.errors?.map((e: any) => `${e.code}: ${e.detail}`).join(', ') || `HTTP ${response.status} ${response.statusText}`;
        console.error(`Pterodactyl API Error on ${method} ${url}: ${errorMessages}`, { responseData });
        
        // Create an error object that includes the status
        const error = new Error(`Pterodactyl API Error: ${errorMessages}`);
        (error as any).status = response.status;
        throw error;
    }
    
    return responseData;
}


interface PteroUserInput {
  discordId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
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
    const { username, email, firstName, lastName, discordId } = input;
    
    if (!input.password) {
        throw new Error("Password is required to create a new Pterodactyl user.");
    }

    const newUserPayload = {
        external_id: discordId,
        email: email,
        username: username,
        first_name: firstName,
        last_name: lastName,
        password: input.password,
        language: 'en'
    };

    const newPteroUser = await pteroRequest('/users', 'POST', newUserPayload);
    const pteroId = newPteroUser.attributes.id;
    console.log(`Successfully created Pterodactyl user ${pteroId} for Discord user ${discordId}`);

    // Update our local DB to link the accounts
    await connection.execute(
        `UPDATE users SET pterodactylId = ? WHERE discordId = ?`,
        [pteroId, discordId]
    );
    console.log(`Successfully linked Pterodactyl ID ${pteroId} to local user with Discord ID ${discordId}`);

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

        let pteroUser;
        // 2. If user exists in our DB and has a Pterodactyl ID, verify it exists in Pterodactyl
        if (userRows.length > 0 && userRows[0].pterodactylId) {
            const pteroId = userRows[0].pterodactylId;
            console.log(`User found in DB with Ptero ID: ${pteroId}. Verifying...`);
            try {
                pteroUser = await pteroRequest(`/users/${pteroId}`);
                console.log(`Pterodactyl user ${pteroUser.attributes.id} verified.`);
                return pteroUser;
            } catch (error: any) {
                if (error.status === 404) {
                    console.warn(`User ${pteroId} not found in Pterodactyl, despite being in DB. A new one will be created.`);
                    // Fall through to the creation logic.
                } else {
                    // For other errors, we re-throw.
                    throw error;
                }
            }
        }
        
        // 3. If we're here, the user either isn't linked or the linked account is gone.
        // We will create a new Pterodactyl user. This now expects a password.
        pteroUser = await createNewPterodactylUser(input, connection);
        return pteroUser;


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
