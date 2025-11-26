import { z } from "zod"

export const permitPlansetSchema = z.object({
  // Step 1
  yourCompanyName: z.string().min(1, "Company name is required"),
  yourEmail: z.string().email("Valid email is required"),
  projectManagerEmail: z.string().email("Valid email is required").optional(),
  newProjectName: z.string().min(1, "Project name is required"),
  jobName: z.string().optional(),
  projectAddress: z.string().min(1, "Project address is required"),

  // Step 2
  propertyCategory: z.string().min(1, "Property category is required"),
  services: z.array(z.string()).min(1, "Select at least one service"),
  batteryBackup: z.boolean().default(false),

  // Step 3
  submissionType: z.string().min(1, "Submission type is required"),
  generalNotes: z.string().optional(),
  projectInstructions: z.string().optional(),

  // Step 4
  systemType: z.string().min(1, "System type is required"),

  // Step 5
  uploads: z
    .object({
      proposedLayout: z.array(z.string()).optional(),
      electricityBill: z.array(z.string()).optional(),
      roofPictures: z.array(z.string()).optional(),
      atticPictures: z.array(z.string()).optional(),
      electricPictures: z.array(z.string()).optional(),
      propertySketch: z.array(z.string()).optional(),
    })
    .optional(),
})

export type PermitPlansetFormData = z.infer<typeof permitPlansetSchema>
