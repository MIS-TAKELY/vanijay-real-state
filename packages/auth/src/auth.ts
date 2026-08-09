import { prisma } from "@repo/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, phoneNumber } from "better-auth/plugins";
import "dotenv/config";
import { emailOtpVerificationOtp } from "./utils/mail-templates/email-otp-verification";
import { sendEmail } from "./utils/send-mail";
import { sendWhatsAppMessage } from "./utils/send-watsapp";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,

  // The browser talks to the API on realstate-api.vanijay.com while the
  // dashboard session check (Next middleware) runs on realstate.vanijay.com.
  // Without this, the session cookie is host-only on the API subdomain and the
  // middleware can't see it → login works but /dashboard bounces back to
  // sign-in. Cross-subdomain cookies set Domain=.vanijay.com so the session is
  // shared across client / admin / api subdomains.
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
  },

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  user: {
    additionalFields: {
      phoneNumber: {
        type: "string",
        required: false,
        unique: true,
      },
      role: {
        type: "string[]",
        required: false,
        defaultValue: ["BUYER"],
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
    requireEmailVerification: true,
  },

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          await sendEmail(
            email,
            "Verify your Lekhaprati account",
            emailOtpVerificationOtp(otp),
          );
        }
      },
      // OTP is valid for 5 minutes
      expiresIn: 300,
    }),
    phoneNumber({
      async sendOTP({ phoneNumber, code }) {
        await sendWhatsAppMessage(
          phoneNumber,
          `Your Lekhaprati code is: ${code}`,
        );
      },
      expiresIn: 300, // 5 min, like your email OTP
      otpLength: 6,
      allowedAttempts: 3, // defaults
    }),
  ],

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  trustedOrigins: [
    process.env.CLIENT_URL ?? "http://localhost:3000",
    ...(process.env.ADMIN_URL ? [process.env.ADMIN_URL] : []),
  ],
});

export type Auth = typeof auth;
