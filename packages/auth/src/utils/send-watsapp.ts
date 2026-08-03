// WhatsApp gateway client for Lekhaprati (real-state).
//
// Sends OTP / notification messages through the shared Vanijay WhatsApp
// gateway (whatsapp-web.js + Puppeteer, hosted at my-whatsapp.vanijay.com).
//
// This mirrors the resilience logic already used by the Vanijay buyer &
// seller apps so transient gateway quirks do not surface as failures to the
// end user:
//   1. The gateway URL is read from WHATSAPP_API_URL (with a fallback to the
//      historical hardcoded host) instead of being hardcoded.
//   2. HTTP 503 ("Session not ready") is retried with a backoff — the
//      whatsapp-web.js session can take a few seconds to (re)initialize.
//   3. Network errors (TypeError from fetch) are retried with a backoff.
//   4. A known post-send crash in the gateway —
//      "Cannot read properties of undefined (reading 'id')" — happens AFTER
//      client.sendMessage() has already delivered the message, while the
//      gateway is building its success JSON. We treat that specific 500 as a
//      success so the user is not told the OTP failed when it actually arrived.

const MAX_RETRIES = 2; // -> up to 3 total attempts
const RETRY_DELAY_MS = 5000;

const FALLBACK_GATEWAY_URL = "https://my-whatsapp.vanijay.com/send-message";

export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string,
): Promise<void> {
  // Read at call time (not module load) so dotenv has always run first.
  const gatewayUrl = process.env.WHATSAPP_API_URL ?? FALLBACK_GATEWAY_URL;

  if (!gatewayUrl) {
    console.warn(
      "[WhatsApp] WHATSAPP_API_URL not configured, skipping send",
    );
    return;
  }

  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    try {
      const res = await fetch(gatewayUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, message }),
      });

      // Happy path: gateway returned 2xx — message delivered.
      if (res.ok) {
        return;
      }

      // Non-2xx: read the body for diagnostics + a readable error message.
      const raw = await res.text().catch(() => "");
      console.error(
        `[WhatsApp] API error (${res.status}) attempt=${attempt} body=${raw}`,
        { phoneNumber },
      );

      // Session still initializing — retry after a short backoff.
      if (res.status === 503 && attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS);
        attempt++;
        continue;
      }

      const parsed = parseBody(raw);
      const errorMessage =
        parsed.details || parsed.error || `WhatsApp send failed: ${res.status}`;

      // Known post-send crash: the gateway already delivered the message but
      // threw while reading `response.id._serialized` to build its success
      // JSON. Treat as delivered (matches Vanijay buyer/seller behaviour).
      if (isProviderPostSendResponseError(errorMessage)) {
        console.warn(
          "[WhatsApp] gateway crashed after successful send; treating message as delivered.",
        );
        return;
      }

      // Genuine failure — surface to better-auth so it can report it.
      throw new Error(errorMessage);
    } catch (error: unknown) {
      // Network-level failure (DNS, connection refused, etc.) — retry once
      // before giving up.
      if (attempt < MAX_RETRIES && error instanceof TypeError) {
        console.warn(
          `[WhatsApp] network error, retrying (attempt ${attempt + 1}/${MAX_RETRIES}): ${
            error.message
          }`,
        );
        await sleep(RETRY_DELAY_MS);
        attempt++;
        continue;
      }
      console.error(
        "[WhatsApp] send failed:",
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseBody(raw: string): {
  success?: boolean;
  error?: string;
  details?: string;
} {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    // body wasn't JSON — return an empty object so callers fall back to a
    // generic message.
    return {};
  }
}

// The whatsapp-web.js gateway occasionally returns a 500 with this message
// AFTER client.sendMessage() has already resolved — i.e. the message was
// delivered, but the gateway crashed while reading `response.id._serialized`
// to build its success JSON. We treat this specific error as "delivered".
function isProviderPostSendResponseError(errorMessage: string): boolean {
  return errorMessage.includes(
    "Cannot read properties of undefined (reading 'id')",
  );
}
