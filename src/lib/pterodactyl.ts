
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
        // If we have a pterodactylId, it means the account is fully set up.
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
         // 1. Check if user exists in our DB
        const [userRows] = await connection.execute<mysql.RowDataPacket[]>(
            'SELECT id, pterodactylId FROM users WHERE discordId = ?',
            [input.discordId]
        );

        if (userRows.length > 0 && userRows[0].pterodactylId) {
            // User and Pterodactyl account already exist and are linked
            const pteroUser = await pteroClient.users.getDetails(userRows[0].pterodactylId);
            return pteroUser;
        }

        // 2. Check Pterodactyl for existing user by external ID just in case
        let existingPteroUser;
        try {
            // The library may throw if no user is found with that external ID.
            const pteroUsers = await pteroClient.users.list({ filter: { external_id: input.discordId }});
            if (pteroUsers.data.length > 0) {
              existingPteroUser = pteroUsers.data[0].attributes;
            }
        } catch (error: any) {
            // It's okay if it's a 404 not found, just means we need to create it.
            // Any other error should be thrown.
            if (error.message && !error.message.includes('Not Found')) {
                throw error;
            }
        }
        
        if (existingPteroUser) {
            // Found a Pterodactyl user, let's link it in our DB
             await connection.execute(
                'UPDATE users SET pterodactylId = ? WHERE discordId = ?',
                [existingPteroUser.id, input.discordId]
            );
            return existingPteroUser;
        }

        // 3. Create a new Pterodactyl user
        console.log(`No Pterodactyl user found for Discord ID ${input.discordId}. Creating a new one.`);

        const { name, email, discordId } = input;
        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ') || firstName;
        const password = input.password || randomBytes(16).toString('hex');

        const newPteroUser = await pteroClient.users.create({
            externalId: discordId,
            email: email,
            username: name.replace(/\s+/g, '_') + `_${discordId.slice(-4)}`,
            firstName: firstName,
            lastName: lastName,
            password: password,
            isAdmin: false,
        });

        console.log(`Successfully created Pterodactyl user ${newPteroUser.attributes.id} for Discord user ${discordId}`);

        // 4. Upsert user in our database and link Pterodactyl ID
        await connection.execute(
            `INSERT INTO users (discordId, pterodactylId, email, name)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE pterodactylId = VALUES(pterodactylId), email = VALUES(email), name = VALUES(name)`,
            [discordId, newPteroUser.attributes.id, email, name]
        );
        console.log(`Successfully created/updated database user record for Discord ID ${discordId}`);

        return newPteroUser.attributes;

    } catch (error: any) {
         if (error.message && error.message.toLowerCase().includes('already been taken')) {
             console.warn(`Pterodactyl user with email ${input.email} or username already exists but is not linked to Discord ID ${input.discordId}.`);
             throw new Error(`An account with this email or username already exists on the panel. Please log in to the panel and link your Discord account in your account settings, or contact support.`);
        }
        console.error('Failed to create or link Pterodactyl user:', error);
        // If user creation succeeded but DB update failed, we should delete the ptero user to allow retry.
        // This logic is complex and would require passing the newPteroUser object around.
        // For now, we'll just throw the error.
        throw error;
    } finally {
        await connection.end();
    }
}


export async function createPterodactylServer(serverConfig: Nodeactyl.CreateServerOptions) {
    try {
        const server = await pteroClient.servers.create(serverConfig);
        return server.attributes;
    } catch (error) {
        console.error('Failed to create Pterodactyl server:', error);
        throw error;
    }
}
