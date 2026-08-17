// src/templates/email/verification-otp.ts

export function emailOtpVerificationOtp(otp: string) {
  return `
    <div style="font-family:sans-serif;max-width:980px;margin:auto">
      <h2 style="color:#1a3c34">Identity Verification</h2>
      <p>We've sent a verification code to confirm your MALPOTH account access.</p>
      <div style="background:#f4f4f4;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
        <p style="color:#555;margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase">
          6-Digit Access Code
        </p>
        <p style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#1a3c34;margin:0">
          ${otp}
        </p>
      </div>
      <p style="color:#888;font-size:13px">
        This code expires in <strong>5 minutes</strong>. 
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;
}
