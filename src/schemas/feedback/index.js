import { z } from "zod";

export const feedbackSchema = z.object({
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters" })
    .max(300, { message: "Content must be no longer than 300 characters" }),
});

