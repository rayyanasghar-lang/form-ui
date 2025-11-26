import { z } from "zod"

export const paymentSchema = z.object({
  // Step 1 - Billing Details
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Valid email is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  apt: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(5, "Valid ZIP code is required"),

  // Step 2 - Payment Details
  amount: z.string().min(1, "Amount is required"),
  paymentReference: z.string().optional(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  checkUpload: z.array(z.string()).optional(),
})

export type PaymentFormData = z.infer<typeof paymentSchema>
