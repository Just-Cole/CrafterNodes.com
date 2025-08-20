
'use server';

import { randomBytes } from 'crypto';
import mysql from 'mysql2/promise';
import fetch from 'node-fetch';

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

const pteroFetch = async (endpoint: string, method: 'GET' | 'POST' | 'DELETE' = 'GET', body: object | null = null) => {
    const url = `${PTERODACTYL_URL}/api/application${endpoint}`;
    const options: any = {
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

    if (response.status === 204) { // No Content
        return null;
    }
    
    const data = await response.json();

    if (!response.ok) {
        const errorMessage = data.errors ? JSON.stringify(data.errors) : `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
    }
    return data;
};


interface PteroUser {
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

interface GetOrCreatePteroUserInput {
  discordId: string;
  email: string;
  name: string;
}

export async function getPterodactylUserByDiscordId(input: GetPteroUserInput): Promise<PteroUser | null> {
    const { discordId } = input;
    try {
        const response = await pteroFetch(`/users/external/${discordId}`);
        return response.attributes;
    } catch (error: any) {
        // A 404 error is expected if the user doesn't exist yet
        if (error.message.includes('404')) {
            return null;
        }
        console.error("Error fetching Pterodactyl user by external ID:", error);
        throw error;
    }
}

export async function getOrCreatePterodactylUser(input: GetOrCreatePteroUserInput): Promise<PteroUser> {
    const existingUser = await getPterodactylUserByDiscordId({ discordId: input.discordId });
    if (existingUser) {
        return existingUser;
    }

    console.log(`No Pterodactyl user found for Discord ID ${input.discordId}. Creating a new one.`);

    const { name, email, discordId } = input;
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;
    const password = randomBytes(16).toString('hex');

    try {
        const createUserData = {
            external_id: discordId,
            email: email,
            username: name.replace(/\s+/g, '_') + `_${discordId.slice(-4)}`,
            first_name: firstName,
            last_name: lastName,
            password: password,
        };

        const response = await pteroFetch('/users', 'POST', createUserData);
        const newUser = response.attributes;

        console.log(`Successfully created Pterodactyl user ${newUser.id} for Discord user ${discordId}`);

        let connection;
        try {
            connection = await getDbConnection();
            await connection.execute(
                'INSERT INTO users (discordId, pterodactylId, email, name) VALUES (?, ?, ?, ?)',
                [discordId, newUser.id, email, name]
            );
             console.log(`Successfully created database user record for Discord ID ${discordId}`);
        } catch(dbError) {
            console.error("Database error while creating user record:", dbError);
            // Roll back Pterodactyl user creation if the database insert fails
            await pteroFetch(`/users/${newUser.id}`, 'DELETE');
            console.error(`Rolled back Pterodactyl user creation for ID ${newUser.id} due to DB error.`);
            throw new Error("Failed to save user to the database after creating Pterodactyl user.");
        } finally {
            await connection?.end();
        }

        return newUser;

    } catch (error: any) {
        if (error.message.includes('already been taken')) {
             console.warn(`Pterodactyl user with email ${email} or username already exists but is not linked to Discord ID ${discordId}.`);
             throw new Error(`An account with this email or username already exists on the panel. Please log in and link your Discord account in your account settings, or contact support.`);
        }
        console.error('Failed to create Pterodactyl user:', error);
        throw error;
    }
}

export async function createPterodactylServer(serverConfig: object) {
    try {
        const response = await pteroFetch('/servers', 'POST', serverConfig);
        return response.attributes;
    } catch (error) {
        console.error('Failed to create Pterodactyl server:', error);
        throw error;
    }
}
