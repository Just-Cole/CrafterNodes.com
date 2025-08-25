
import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import { initialUserSetup } from "@/app/actions/user";
import mysql from 'mysql2/promise';

// IMPORTANT: Replace this with your actual database connection string.
const DATABASE_URL = "mysql://crafteruser:%23Tjc52302@172.93.108.112:3306/crafternodes";

async function getConnection() {
    if (!DATABASE_URL) {
        throw new Error(
            'DATABASE_URL is not set. Please add it directly in the auth route.'
        );
    }
    return mysql.createConnection(DATABASE_URL);
}


export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Discord({
        clientId: process.env.DISCORD_CLIENT_ID!,
        clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        // Define scopes needed. 'identify' and 'email' are common.
        authorization: { params: { scope: 'identify email' } },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
        if (account?.provider === 'discord') {
            if (!user.id || !user.email || !user.name) return false;
            
            // Perform the initial setup which creates users in the DB and Pterodactyl
            const setupResult = await initialUserSetup({
                discordId: user.id,
                email: user.email,
                name: user.name,
            });

            // If the setup fails, prevent sign-in
            if (!setupResult.success) {
                console.error("Failed to complete initial user setup on sign-in:", setupResult.error);
                return false;
            }
        }
        return true; // Allow sign-in
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub; // token.sub is the user's ID from the provider (Discord ID)

        const connection = await getConnection();
        try {
            // Fetch the user from your database to check for admin status
            const [rows] = await connection.execute<mysql.RowDataPacket[]>(
                'SELECT pterodactylId FROM users WHERE externalId = ?',
                [session.user.id]
            );

            if (rows.length > 0) {
                const pteroId = rows[0].pterodactylId;
                // You might need a separate call to Pterodactyl to check for admin status
                // For now, we assume a field `isAdmin` could exist on the ptero user object
                // This is a placeholder for actual admin-checking logic.
                 const pteroUserResponse = await fetch(`${process.env.PTERODACTYL_PANEL_URL}/api/application/users/${pteroId}`, {
                    headers: {
                        'Authorization': `Bearer ${process.env.PTERODACTYL_API_KEY}`,
                        'Accept': 'application/json',
                    },
                 });
                 if (pteroUserResponse.ok) {
                    const pteroUser = await pteroUserResponse.json();
                    session.user.isAdmin = pteroUser.attributes.root_admin;
                 } else {
                    session.user.isAdmin = false;
                 }

            } else {
                session.user.isAdmin = false;
            }
        } catch (error) {
            console.error("Error fetching user admin status:", error);
            session.user.isAdmin = false;
        } finally {
            await connection.end();
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // On initial sign-in, user and account objects are available
      if (account && user) {
        // Persist the user ID from the provider into the token
        token.id = user.id;
      }
      return token;
    },
  },
  // Add secret for production environments
  secret: process.env.AUTH_SECRET,
})
