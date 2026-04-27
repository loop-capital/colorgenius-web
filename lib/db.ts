import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

let prisma: PrismaClient;

if (typeof window === 'undefined') {
  // Server-side
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
  } else {
    if (!global.__db) {
      global.__db = new PrismaClient();
    }
    prisma = global.__db;
  }
} else {
  // Client-side (this will be empty in browser)
  prisma = new PrismaClient();
}

export const db = prisma;