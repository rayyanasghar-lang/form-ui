import { Project } from "@/types/project"

export const CalculateProjectProgress = (p: Project | null) : number=>{
if(!p) return 0;
const fields = [
      // User Profile
      p.user_profile?.contact_name,
      p.user_profile?.company_name,
      p.user_profile?.email,
      p.user_profile?.phone,
      // Project Info
      p.name,
      p.address,
      // System Summary
      p.system_summary?.system_size,
      p.system_summary?.system_type,
      p.system_summary?.pv_modules,
      p.system_summary?.inverters,
      // Site Details
      p.site_details?.roof_material,
      p.site_details?.roof_pitch,
      p.site_details?.number_of_arrays,
      p.site_details?.utility_provider,
      p.site_details?.jurisdiction,
      // Electrical Details
      p.electrical_details?.main_panel_size,
      p.electrical_details?.bus_rating,
      p.electrical_details?.main_breaker,
      p.electrical_details?.pv_breaker_location,
      // Advanced Electrical
      p.advanced_electrical_details?.meter_location,
      p.advanced_electrical_details?.service_entrance_type,
      p.advanced_electrical_details?.subpanel_details,
      // General Notes
      p.general_notes,
    ]
    const filled = fields.filter(f => f !== undefined && f !== null && f !== "").length
    return Math.round((filled / fields.length) * 100)

}