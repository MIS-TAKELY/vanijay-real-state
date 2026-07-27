"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/auth";

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
    const response = await fetch(`${API_URL}/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "Sign up failed" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("signup error-->", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign up failed",
    };
  }
};
