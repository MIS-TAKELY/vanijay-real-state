import { emailOTPClient, phoneNumberClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // `||` (not `??`): an EMPTY string would otherwise silently make the client
  // call the API same-origin and break behind a rewrite. Fall back to localhost.
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  plugins: [emailOTPClient(), phoneNumberClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
