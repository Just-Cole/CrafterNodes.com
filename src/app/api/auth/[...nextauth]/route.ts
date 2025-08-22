
import NextAuth, { type AuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
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
        // When a user signs in with Discord, we'll create a record for them in our DB
        // if one doesn't already exist. The Pterodactyl account creation is now handled
        // separately during the first checkout.
        let connection;
        try {
          connection = await getDbConnection();
          // Use INSERT ... ON DUPLICATE KEY UPDATE to avoid errors if the user already exists
          await connection.execute(
            `INSERT INTO users (discordId, email, name)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE email = VALUES(email), name = VALUES(name)`,
            [user.id, user.email, user.name]
          );
          console.log(`[Auth] User ${user.name} signed in. Ensured database record exists.`);
        } catch (error) {
          console.error('[Auth] Failed to create or update user record on sign-in:', error);
        } finally {
            await connection?.end();
        }
      }
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
