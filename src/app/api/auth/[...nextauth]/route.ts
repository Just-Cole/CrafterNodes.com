
import NextAuth, { type AuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { getOrCreatePterodactylUser } from "@/lib/pterodactyl";

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
      if (user.id && user.email && user.name) {
        try {
          const pteroUser = await getOrCreatePterodactylUser({
            discordId: user.id,
            email: user.email,
            name: user.name
          });
          console.log(`Successfully synced user ${user.id} with Pterodactyl user ${pteroUser.id}`);
        } catch (error) {
          console.error(`Failed to sync user ${user.id} with Pterodactyl:`, error);
          // Decide if you want to block sign-in on failure. For now, we allow it.
        }
      }
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
