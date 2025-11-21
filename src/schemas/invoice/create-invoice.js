import { z } from "zod";

export const createInvoiceSchema = z.object({
  // Business Details
  businessName: z.string().min(1, "Business name is required"),
  businessEmail: z.string().email("Invalid email address"),
  businessPhone: z.string().optional(),
  businessAddress: z.string().min(1, "Business address is required"),
  gstin: z.string().optional(),
  gstinHolderName: z.string().optional(),

  // Customer Details
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().optional(),
  customerAddress: z.string().min(1, "Customer address is required"),

  // Invoice Meta Details
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().optional(),
  paymentTerms: z.string(),

  // Services/Items
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        rate: z.number().min(0, "Rate must be 0 or greater"),
        amount: z.number(),
        discount: z.number().min(0).max(100),
        tax: z.number().min(0).max(100),
      })
    )
    .min(1, "At least one item is required"),

  // Payment Info
  bankDetails: z.string().optional(),
  paymentMethod: z.string(),
  paymentInstructions: z
    .string()
    .max(200, "Payment instructions must not exceed 200 characters")
    .optional(),

  // Notes
  notes: z.string().max(200, "Notes must not exceed 200 characters").optional(),

  // Add-ons
  includeFeedbackForm: z.boolean(),
  addCoupon: z.boolean(),
  coupon: z
    .object({
      code: z.string().optional(),
      description: z.string().optional(),
      expiryDays: z.string().optional(),
    })
    .optional(),
});

