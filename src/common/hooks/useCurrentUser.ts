import { useSession, signOut } from "next-auth/react";
import { DefaultSession } from "next-auth";

export const useCurrentUser = () => {
    const {data: session, status} = useSession()
    const user: DefaultSession["user"] | null = session?.user || null; 

    return {
        user,
        status,
        signOut
    }
}