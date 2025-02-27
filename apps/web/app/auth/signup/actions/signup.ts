"use server";

import { z } from "zod";

export interface ActionResponse<T = Record<string, unknown>> {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof T]?: string[];
  };
}

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character"),
  // confirmPassword: z.string().min(1, "Confirm password is required"),
});
// .refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords must match",
//   path: ["confirmPassword"],
// });

export type SignupFormData = z.infer<typeof signupSchema>;

export async function signup(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse<SignupFormData>> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const rawData: SignupFormData = {
      name: formData.get("name")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      password: formData.get("password")?.toString() || "",
      // confirmPassword: formData.get("confirmPassword")?.toString() || "",
    };

    const validatedData = signupSchema.safeParse(rawData);

    if (!validatedData.success) {
      return {
        success: false,
        message: "Please fix the errors in the form",
        errors: validatedData.error.flatten().fieldErrors,
      };
    }

    console.log("Signup data submitted:", validatedData.data);

    return {
      success: true,
      message: "Signup successful!",
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}
