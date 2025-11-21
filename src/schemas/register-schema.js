import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(2, "Username must be atleast 2 characters")
  .max(20, "Username must be atmost 20 characters")
  .trim()
  .regex(
    /^(?!.*\s)[a-zA-Z0-9_]+$/,
    "No special characters or empty spaces allowed"
  );

export const registerSchema = z
  .object({
    username: usernameValidation,
    businessName: z
      .string()
      .trim()
      .min(1, "Business name is required")
      .regex(
        /^[^\s].*[^\s]$/,
        "Business name must not contain leading or trailing spaces"
      ),
    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .regex(
        /^[^\s]*$/,
        "Email must not contain any spaces"
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .trim()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?& ]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      )
      .regex(/^\S*$/, "Password must not contain spaces"),
    confirmPassword: z
      .string()
      .trim()
      .min(8, "Confirm password must be at least 8 characters")
      .regex(
        /^\S.*\S$|^\S$/,
        "Confirm password must not contain trailing spaces"
      )
      .regex(/^\S*$/, "Confirm password must not contain spaces"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Ye confirmPassword field pe error show karega
  });
