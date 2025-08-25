
import NextAuth, { AuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import mysql from 'mysql2/promise';
import { getOrCreatePterodactylUser } from "@/lib/pterodactyl";

const DATABASE_URL = "mysql://crafteruser:%23Tjc52302@172.93.108.112:3306/crafternodes";

async function getDbConnection() {
    if (!DATABASE_URL) {
        throw new Error('DATABASE_URL is not set.');
    }
    return mysql.createConnection(DATABASE_URL);
}


export const authOptions: AuthOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            authorization: "https://discord.com/api/oauth2/authorize?scope=identify+email",
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!profile?.email || !user.id || !user.name) {
                console.error("Discord profile is missing required information.");
                return false; // Prevent sign-in
            }

            // This sign-in will now only create a basic user record.
            // The Pterodactyl account will be created on-demand when the user
            // tries to purchase a server for the first time.
            let connection;
            try {
                connection = await getDbConnection();
                // This query ensures that if the user already exists (based on the unique discordId),
                // it updates their email and name. If they don't exist, it inserts a new record.
                // This handles both new and returning users gracefully.
                await connection.execute(
                    `INSERT INTO users (discordId, email, name)
                     VALUES (?, ?, ?)
                     ON DUPLICATE KEY UPDATE email = VALUES(email), name = VALUES(name)`,
                    [user.id, profile.email, user.name]
                );
                return true;
            } catch (error) {
                console.error("Error during simplified signIn callback:", error);
                return false; // Prevent sign-in on error
            } finally {
                if (connection) {
                    await connection.end();
                }
            }
        },
        async jwt({ token, user, account, profile }) {
            // On sign in
            if (user && account && profile) {
                token.id = user.id; // Discord user ID
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id as string;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
