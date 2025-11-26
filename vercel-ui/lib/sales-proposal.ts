import { z } from "zod"

export const salesProposalSchema = z.object({
  // Step 1
  projectType: z.string().min(1, "Project type is required"),
  projectName: z.string().min(1, "Project name is required"),
  projectAddress: z.string().min(1, "Project address is required"),
  isNewConstruction: z.string().min(1, "Please select an option"),

  // Step 2
  systemSizing: z.string().min(1, "System sizing strategy is required"),
  fireOffset: z.string().min(1, "Minimum fire offset is required"),
  electricityBillAvailable: z.string().min(1, "Please select an option"),
  annualConsumption: z.string().min(1, "Annual consumption is required"),

  // Step 3
  purchasePreference: z.string().min(1, "Purchase preference is required"),
  projectNotes: z.string().optional(),

  // Step 4
  pricePerWatt: z.string().min(1, "Price per watt is required"),
  moduleManufacturer: z.string().min(1, "Module manufacturer is required"),
  moduleWattage: z.string().min(1, "Module wattage is required"),
  inverterType: z.string().min(1, "Inverter type is required"),

  // Step 5
  projectManagerEmail: z.string().email("Valid email is required"),
  companyName: z.string().min(1, "Company name is required"),
  projectResources: z.array(z.string()).optional(),
})

export type SalesProposalFormData = z.infer<typeof salesProposalSchema>
