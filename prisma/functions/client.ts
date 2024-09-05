import { PrismaClient } from "@prisma/client"
import prismaRandom from "prisma-extension-random"

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient
}

// Checks if globalForPrisma.prisma already exists
// If it does, it reuses that instance
// Otherwise, it creates a new instance of PrismaClient
export const prisma =
	globalForPrisma.prisma || new PrismaClient().$extends(prismaRandom())

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
