"use server";

import { apiFetch, ApiError, API_ENDPOINTS } from "lib/api";

export const sign_up_action = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  try {
    const data = await apiFetch<{ message?: string }>(
      API_ENDPOINTS.auth.signUpEmail,
      {
        method: "POST",
        body: { name, email, password },
      },
    );
    return { success: true, data };
  } catch (error) {
    console.error("signup error-->", error);
    return {
      success: false,
      error:
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Sign up failed",
    };
  }
};
