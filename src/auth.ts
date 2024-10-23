import NextAuth, {DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import authConfig from "./auth.config"
import { db } from "./lib/db"
import { getUserByEmail } from "./common/actions/user-data"


interface CustomJWT {
  id?: string;
  role?: string;
  email?: string | null;
  sub?: string;
}

interface CustomSession extends DefaultSession {
  user: {
    id?: string;
    role?: string;
  } & DefaultSession["user"];
}
 
export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: {strategy: 'jwt'},
  callbacks: {
    async jwt({token}: {token: CustomJWT}) {
      if(!token.sub) return token;

      const existingUser = await getUserByEmail(token?.email as string)

      if(!existingUser) return token;

      token.role = existingUser.role;
      token.id = existingUser.id;

      return token
    },
    async session ({session, token}: { session: CustomSession, token: CustomJWT }) {
      if(token.role && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }

      return session;
    }
  }
  
})