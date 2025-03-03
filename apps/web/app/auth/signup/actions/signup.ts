"use server";
import "server-only";
import { signupSchema } from "./schema";
import { z } from "zod";

type FormState = {
  success: boolean;
  fields?: Record<string, string>;
  errors?: Record<string, string[]>;
};

export type SignupFormData = z.infer<typeof signupSchema>;

export async function signup(
  prevState: FormState,
  payload: FormData,
): Promise<FormState> {
  console.log("payload received", payload);

  if (!(payload instanceof FormData)) {
    return {
      success: false,
      errors: { error: ["Invalid Form Data"] },
    };
  }

  const formData = Object.fromEntries(payload);
  console.log("form data", formData);

  const parsed = signupSchema.safeParse(formData);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const fields: Record<string, string> = {};

    for (const key of Object.keys(formData)) {
      fields[key] = formData[key]?.toString() || "";
    }
    console.log("error returned data", formData);
    console.log("error returned error", errors);
    return {
      success: false,
      fields,
      errors,
    };
  }

  console.log("parsed data", parsed.data);
  return {
    success: true,
  };
}
