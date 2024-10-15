import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import authConfig from "./auth.config";
import { apiAuthPrefix, authRoutes, DEFAULT_LOGIN_DIRECT, publicRoutes } from "./routes";

const {auth} = NextAuth(authConfig)

export default auth((req) => {
    const {nextUrl} = req;
    const isLoggedIn: boolean = !!req.auth;
    
    const isApiAuthRoute: boolean = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute: boolean = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute: boolean = authRoutes.includes(nextUrl.pathname);

    if(isApiAuthRoute) return null 

    if(isAuthRoute) {
        if(isLoggedIn) {
            return NextResponse.redirect(new URL(DEFAULT_LOGIN_DIRECT, nextUrl));
        }

        return null 
    }

    if(!isLoggedIn && !isPublicRoute) {
        return NextResponse.redirect(new URL('/', nextUrl))
    }


    return null;
})


export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
