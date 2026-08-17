// src/templates/email/change-email.ts

export function changeEmailConfirmation(url: string, newEmail: string) {
  return `
    <div style="font-family:sans-serif;max-width:980px;margin:auto">
      <h2 style="color:#1a3c34">Approve Your Email Change</h2>
      <p>We received a request to change your MALPOTH account email to <strong>${newEmail}</strong>.</p>
      <p>If this was you, click the button below to approve the change. We'll then send a verification link to your new address.</p>
      <div style="text-align:center;margin:24px 0">
        <a href="${url}" style="background:#1a3c34;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">
          Approve email change
        </a>
      </div>
      <p style="color:#888;font-size:13px">
        This link expires in <strong>1 hour</strong>.
        If you didn't request this, you can safely ignore this email — your email will not be changed.
      </p>
    </div>
  `;
}

export function changeEmailVerification(url: string) {
  return `
    <div style="font-family:sans-serif;max-width:980px;margin:auto">
      <h2 style="color:#1a3c34">Verify Your New Email</h2>
      <p>To finish changing your MALPOTH account email, click the button below to verify your new address.</p>
      <div style="text-align:center;margin:24px 0">
        <a href="${url}" style="background:#1a3c34;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">
          Verify email
        </a>
      </div>
      <p style="color:#888;font-size:13px">
        This link expires in <strong>1 hour</strong>.
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;
}
