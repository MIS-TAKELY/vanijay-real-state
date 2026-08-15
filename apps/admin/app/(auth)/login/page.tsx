"use client";

import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { LoginSplash } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSplash />}>
      <LoginForm />
    </Suspense>
  );
}
