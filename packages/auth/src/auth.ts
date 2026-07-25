import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/db";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // No modelName overrides needed — Better Auth defaults (user, session,
  // account, verification) now match our Prisma model names exactly.

  user: {
    additionalFields: {
      phoneNumber: {
        type: "string",
        required: false,
        unique: true,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "BUYER",
      },
      isVerified: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      agreedToTerms: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      agencyId: {
        type: "string",
        required: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  trustedOrigins: [
    process.env.CLIENT_URL ?? "http://localhost:3000",
  ],
});

export type Auth = typeof auth;