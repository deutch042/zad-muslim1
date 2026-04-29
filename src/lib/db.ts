import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let db: PrismaClient | null;

try {
  db =
    globalForPrisma.prisma ??
    new PrismaClient();

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
} catch (error) {
  console.warn(
    'Failed to initialize PrismaClient. Database features will be unavailable.',
    error
  );
  db = null;
}

export { db };
