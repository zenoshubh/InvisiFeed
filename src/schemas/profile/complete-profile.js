import { z } from "zod";

export const completeProfileSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  localAddress: z.string().min(1, "Local address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pincode: z.string().min(1, "Pincode is required"),
});

// Simplified client-side schema for form validation only
export const clientFormSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

