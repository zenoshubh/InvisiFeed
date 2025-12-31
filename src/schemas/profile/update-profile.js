import { z } from "zod";

export const updateProfileSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  phoneNumber: z.string(),
  address: z.object({
    country: z.string(),
    state: z.string(),
    city: z.string(),
    localAddress: z.string(),
    pincode: z.string(),
  }),
});

