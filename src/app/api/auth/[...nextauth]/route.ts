
import { getOrCreatePterodactylUser } from "@/lib/pterodactyl";
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
        async jwt({ token, user, account, profile }) {
            // On sign in
            if (user && account && profile) {
                token.id = user.id; // Discord user ID
                token.name = profile.username;
                token.email = profile.email;
                token.image = profile.image_url;

                try {
                    console.log("Attempting to get or create Pterodactyl user...");
                    const pteroUser = await getOrCreatePterodactylUser({
                        externalId: user.id,
                        email: profile.email!,
                        name: profile.global_name || profile.username,
                    });
                    
                    if (pteroUser && pteroUser.attributes) {
                        console.log("Pterodactyl user confirmed/created with ID:", pteroUser.attributes.id);
                        token.pterodactylId = pteroUser.attributes.id;
                        token.isAdmin = pteroUser.attributes.root_admin;
                    } else {
                        console.error("Failed to get or create a valid Pterodactyl user object.");
                        token.pterodactylId = null;
                        token.isAdmin = false;
                    }

                } catch (error) {
                    console.error("Error in JWT callback during Pterodactyl user creation:", error);
                    // Prevent login if Pterodactyl user creation fails
                    return Promise.reject(new Error("Failed to provision Pterodactyl account."));
                }
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id as string;
            session.user.pterodactylId = token.pterodactylId as number;
            session.user.isAdmin = token.isAdmin as boolean;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
