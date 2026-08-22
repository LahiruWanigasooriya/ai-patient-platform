"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    // If it's an AuthError, return the message to the UI
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong with authentication.";
      }
    }
    
    // If it's a redirect error (which is thrown on success), we MUST re-throw it!
    // Next.js relies on catching this error to actually perform the redirect.
    throw error;
  }
}

export async function googleSignIn() {
  await signIn("google");
}
