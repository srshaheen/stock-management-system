import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 1. pg package diye database connection pool toiri kora
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 2. Prisma-r jonno oi pool-take adapter-e convert kora
const adapter = new PrismaPg(pool);

// 3. Ekhon PrismaClient-ke exactly je options shey chay sheta dewa holo
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
