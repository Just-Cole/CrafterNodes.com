
import NextAuth, { AuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import mysql from 'mysql2/promise';

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
            
            let connection;
            try {
                connection = await getDbConnection();
                await connection.execute(
                    `INSERT INTO users (discordId, email, name)
                     VALUES (?, ?, ?)
                     ON DUPLICATE KEY UPDATE email = VALUES(email), name = VALUES(name)`,
                    [user.id, profile.email, user.name]
                );
                return true;
            } catch (error) {
                console.error("Error during signIn callback:", error);
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
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
