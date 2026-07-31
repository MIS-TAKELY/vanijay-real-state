import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { prisma } from "@repo/db";
import nodemailer from "nodemailer";

// ---------------------------------------------------------------------------
// Nodemailer transport — uses real SMTP when SMTP_HOST is set, otherwise
// auto-creates an Ethereal test account and logs the preview URL to the
// console (great for local dev / zero-config testing).
// ---------------------------------------------------------------------------
async function createTransport() {
  console.log("process.env.SMTP_HOST-->",process.env.SMTP_HOST)
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    });
  }

  // Ethereal fallback for development
  const testAccount = await nodemailer.createTestAccount();
  console.log("\n📧 [Ethereal SMTP] No SMTP_HOST found — using test account:");
  console.log(`   User: ${testAccount.user}`);
  console.log(`   Pass: ${testAccount.pass}`);
  console.log("   Preview URL will be logged when an email is sent.\n");

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

// Reuse a single transport instance across all sends.
let _transport: nodemailer.Transporter | null = null;
async function getTransport() {
  if (!_transport) _transport = await createTransport();
  return _transport;
}

async function sendEmail(to: string, subject: string, html: string) {
  const transport = await getTransport();
  const from = process.env.SMTP_FROM ?? '"Lekhaprati" <noreply@lekhaprati.com>';
  const info = await transport.sendMail({ from, to, subject, html });

  // Log Ethereal preview link when in dev mode
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`\n📬 [OTP Email] Preview: ${previewUrl}\n`);
  }
}

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
            `
            <div style="font-family:sans-serif;max-width:980px;margin:auto">
              <h2 style="color:#1a3c34">Identity Verification</h2>
              <p>We've sent a verification code to confirm your Lekhaprati account access.</p>
              <div style="background:#f4f4f4;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
                <p style="color:#555;margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase">6-Digit Access Code</p>
                <p style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#1a3c34;margin:0">${otp}</p>
              </div>
              <p style="color:#888;font-size:13px">This code expires in <strong>5 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
            </div>
            `,
          );
        }
      },
      // OTP is valid for 5 minutes
      expiresIn: 300,
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
  ],
});

export type Auth = typeof auth;