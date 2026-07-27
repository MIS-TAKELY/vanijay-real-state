import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";


export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  plugins: [emailOTPClient()],
});

export const { signIn, signOut, signUp, useSession ,} = authClient;


