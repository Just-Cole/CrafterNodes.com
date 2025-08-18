
'use server';

import fetch from 'node-fetch';
import { randomBytes } from 'crypto';
import mysql from 'mysql2/promise';

const PTERODACTYL_URL = process.env.PTERODACTYL_PANEL_URL;
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_API_KEY;
const DATABASE_URL = "mysql://crafteruser:%23Tjc52302@172.93.108.112:3306/crafternodes";

async function getDbConnection() {
    if (!DATABASE_URL) {
        throw new Error('DATABASE_URL is not set.');
    }
    return mysql.createConnection(DATABASE_URL);
}

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

interface GetOrCreatePteroUserInput {
  discordId: string;
  email: string;
  name: string;
}

/**
 * Finds a Pterodactyl user by their external ID (which should be their Discord ID).
 * This is used during the checkout process to find the user to provision the server for.
 * @param {GetPteroUserInput} input - The user's Discord ID.
 * @returns {Promise<PteroUserAttributes | null>} The Pterodactyl user object, or null if not found.
 */
export async function getPterodactylUserByDiscordId(input: GetPteroUserInput): Promise<PteroUserAttributes | null> {
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
            return null; // User not found
        }
        
        const errorBody = await response.text();
        throw new Error(`Failed to fetch Pterodactyl user. Status: ${response.status}, Body: ${errorBody}`);

    } catch (error) {
        console.error("Error fetching Pterodactyl user by external ID:", error);
        throw error;
    }
}


/**
 * Fetches a Pterodactyl user by their Discord ID, or creates one if they don't exist.
 * This is called on every sign-in to ensure a Pterodactyl account exists.
 * @param {GetOrCreatePteroUserInput} input - User details from Discord.
 * @returns {Promise<PteroUserAttributes>} The existing or newly created Pterodactyl user.
 */
export async function getOrCreatePterodactylUser(input: GetOrCreatePteroUserInput): Promise<PteroUserAttributes> {
    const existingUser = await getPterodactylUserByDiscordId({ discordId: input.discordId });
    if (existingUser) {
        return existingUser;
    }

    console.log(`No Pterodactyl user found for Discord ID ${input.discordId}. Creating a new one.`);

    const { name, email, discordId } = input;
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || firstName; // Handle names without spaces

    // Generate a secure random password. The user will use "Forgot Password" to set their own.
    const password = randomBytes(16).toString('hex');
    
    const pteroResponse = await fetch(`${PTERODACTYL_URL}/api/application/users`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            external_id: discordId,
            email: email,
            username: name.replace(/\s+/g, '_') + `_${discordId.slice(-4)}`, // Create a unique username
            first_name: firstName,
            last_name: lastName,
            password: password,
            root_admin: false,
            language: 'en',
        }),
    });

    if (!pteroResponse.ok) {
        const errorData = await pteroResponse.json();
        if (pteroResponse.status === 422 && errorData.errors?.some((e: any) => e.code === 'UnprocessableEntityHttpException' && e.detail.includes('email'))) {
             console.warn(`Pterodactyl user with email ${email} already exists but is not linked to Discord ID ${discordId}.`);
             throw new Error(`An account with the email ${email} already exists on the panel. Please log in with your email and password and link your Discord account in your account settings.`);
        }
        throw new Error(`Failed to create Pterodactyl user. Status: ${pteroResponse.status}, Body: ${JSON.stringify(errorData)}`);
    }
    
    const newUser = (await pteroResponse.json()).attributes as PteroUserAttributes;
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
        // If the DB write fails, we should ideally delete the Pterodactyl user to avoid inconsistency.
        // This is a compensating transaction.
        await fetch(`${PTERODACTYL_URL}/api/application/users/${newUser.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
            },
        });
        console.error(`Rolled back Pterodactyl user creation for ID ${newUser.id} due to DB error.`);
        throw new Error("Failed to save user to the database after creating Pterodactyl user.");
    } finally {
        await connection?.end();
    }

    return newUser;
}

