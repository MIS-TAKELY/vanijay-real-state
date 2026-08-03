import nodemailer from "nodemailer";

async function createTransport() {
  console.log("process.env.SMTP_HOST-->", process.env.SMTP_HOST);
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

export async function sendEmail(to: string, subject: string, html: string) {
  const transport = await getTransport();
  const from = process.env.SMTP_FROM ?? '"Lekhaprati" <noreply@lekhaprati.com>';
  const info = await transport.sendMail({ from, to, subject, html });

  // Log Ethereal preview link when in dev mode
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`\n📬 [OTP Email] Preview: ${previewUrl}\n`);
  }
}
