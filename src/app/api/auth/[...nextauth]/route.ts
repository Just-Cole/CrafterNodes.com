
import NextAuth, { type AuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
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
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }: { session: any, token: any }) {
      if (session?.user) {
        session.user.id = token.sub; // token.sub is the user's Discord ID
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'discord' && user.id && user.email && user.name) {
        let connection;
        try {
            // First, ensure a Pterodactyl user exists to get the ID
            const pteroUser = await getOrCreatePterodactylUser({
              discordId: user.id,
              email: user.email,
              name: user.name,
              // A password is not needed here as getOrCreate handles it if creation is required
            });

            if (!pteroUser?.attributes?.id) {
                throw new Error("Failed to get or create Pterodactyl user ID.");
            }
            const pterodactylId = pteroUser.attributes.id;

            // Now, insert into our database with the Pterodactyl ID
            connection = await getDbConnection();
            await connection.execute(
                `INSERT INTO users (discordId, pterodactylId, email, name)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE pterodactylId = VALUES(pterodactylId), email = VALUES(email), name = VALUES(name)`,
                [user.id, pterodactylId, user.email, user.name]
            );
            console.log(`[Auth] User ${user.name} signed in. Ensured database and Pterodactyl records exist.`);
        } catch (error) {
          console.error('[Auth] Failed to complete sign-in process:', error);
          // Throwing the error here will cause the generic "Callback" error page,
          // which is the expected behavior when the sign-in flow fails.
          throw error; 
        } finally {
            await connection?.end();
        }
      }
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
