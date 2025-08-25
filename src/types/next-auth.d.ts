
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Extends the built-in session to add the `isAdmin` property.
   */
  interface Session {
    user?: {
      id: string;
      isAdmin?: boolean;
    } & DefaultSession["user"]
  }

   interface User {
    isAdmin?: boolean
  }
}

declare module "next-auth/jwt" {
  /** Extends the built-in JWT type. */
  interface JWT {
    isAdmin?: boolean
  }
}
