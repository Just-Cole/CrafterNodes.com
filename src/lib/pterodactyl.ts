
'use server';

import { randomBytes } from 'crypto';
import mysql from 'mysql2/promise';
import Nodeactyl from 'nodeactyl';

const PTERODACTYL_URL = process.env.PTERODACTYL_PANEL_URL;
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_API_KEY;
const DATABASE_URL = "mysql://crafteruser:%23Tjc52302@172.93.108.112:3306/crafternodes";

if (!PTERODACTYL_URL || !PTERODACTYL_API_KEY) {
    throw new Error("Pterodactyl environment variables are not set.");
}

const pteroClient = new Nodeactyl.NodeactylClient(PTERODACTYL_URL, PTERODACTYL_API_KEY);

async function getDbConnection() {
    if (!DATABASE_URL) {
        throw new Error('DATABASE_URL is not set.');
    }
    return mysql.createConnection(DATABASE_URL);
}

interface GetOrCreatePteroUserInput {
  discordId: string;
  email: string;
  name: string;
}

export async function getOrCreatePterodactylUser(input: GetOrCreatePteroUserInput) {
    let existingUser;
    try {
        existingUser = await pteroClient.getUserDetails(0, { filter: { external_id: input.discordId } });
    } catch (error: any) {
        // nodeactyl throws an error with a message for 404, not a status code
        if (error.message && !error.message.includes('Not Found')) {
            throw error; // Re-throw if it's not a 'user not found' error
        }
    }
    
    if (existingUser) {
        return existingUser;
    }

    console.log(`No Pterodactyl user found for Discord ID ${input.discordId}. Creating a new one.`);

    const { name, email, discordId } = input;
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;
    const password = randomBytes(16).toString('hex');

    try {
        const newUser = await pteroClient.createUser({
            externalId: discordId,
            email: email,
            username: name.replace(/\s+/g, '_') + `_${discordId.slice(-4)}`,
            firstName: firstName,
            lastName: lastName,
            password: password,
            isAdmin: false,
        });

        console.log(`Successfully created Pterodactyl user ${newUser.attributes.id} for Discord user ${discordId}`);

        let connection;
        try {
            connection = await getDbConnection();
            await connection.execute(
                'INSERT INTO users (discordId, pterodactylId, email, name) VALUES (?, ?, ?, ?)',
                [discordId, newUser.attributes.id, email, name]
            );
             console.log(`Successfully created database user record for Discord ID ${discordId}`);
        } catch(dbError) {
            console.error("Database error while creating user record:", dbError);
            // Roll back Pterodactyl user creation if the database insert fails
            await pteroClient.deleteUser(newUser.attributes.id);
            console.error(`Rolled back Pterodactyl user creation for ID ${newUser.attributes.id} due to DB error.`);
            throw new Error("Failed to save user to the database after creating Pterodactyl user.");
        } finally {
            await connection?.end();
        }

        return newUser.attributes;

    } catch (error: any) {
        if (error.message && error.message.toLowerCase().includes('already been taken')) {
             console.warn(`Pterodactyl user with email ${email} or username already exists but is not linked to Discord ID ${discordId}.`);
             throw new Error(`An account with this email or username already exists on the panel. Please log in and link your Discord account in your account settings, or contact support.`);
        }
        console.error('Failed to create Pterodactyl user:', error);
        throw error;
    }
}


export async function createPterodactylServer(serverConfig: Nodeactyl.CreateServerOptions) {
    try {
        const server = await pteroClient.createServer(serverConfig);
        return server.attributes;
    } catch (error) {
        console.error('Failed to create Pterodactyl server:', error);
        throw error;
    }
}
