import { PrismaClient } from "@prisma/client";

declare global {
    let prisma: PrismaClient | undefined
}

const prismaClient = globalThis.prisma || new PrismaClient();


if (process.env.NODE_ENV !== 'production'){
    globalThis.prisma = prismaClient;
}

export const db = prismaClient;