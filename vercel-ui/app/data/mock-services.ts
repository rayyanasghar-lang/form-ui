
export type QuestionType = 'text' | 'number' | 'select' | 'boolean' | 'date' | 'textarea';

export interface ServiceQuestion {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[];
  mapping?: string; // Path to project field, e.g., 'system_summary.system_size'
  required?: boolean;
  placeholder?: string;
  description?: string;
}

export interface ServiceStep {
  title: string;
  description?: string;
  questions: ServiceQuestion[];
}

export interface ServiceDefinition {
  id: string; // This should match the ID from the backend (or we map it)
  name: string;
  description: string;
  steps: ServiceStep[];
}

// Mock Data matching the user's requirements:
// "the services in backend will store it's name and questions... related to that service"
// "data that will be common im services's questions and stored in the services table are attributes project table"

export const MOCK_SERVICES: ServiceDefinition[] = [
  {
    id: "solar", // This ID needs to match what the backend returns for "Solar"
    name: "Solar",
    description: "Photovoltaic system installation details",
    steps: [
      {
        title: "System Basics",
        description: "Core system information",
        questions: [
          {
            id: "system_size",
            label: "System Size (kW DC)",
            type: "number",
            required: true,
            mapping: "system_summary.system_size",
            placeholder: "e.g. 5.4"
          },
          {
            id: "system_type",
            label: "System Type",
            type: "select",
            options: ["Roof Mount", "Ground Mount", "Carport", "Both"],
            required: true,
             mapping: "system_summary.system_type"
          },
          {
             id: "module_count",
             label: "Number of PV Modules",
             type: "number",
             mapping: "system_summary.pv_modules"
          },
           {
             id: "inverter_count",
             label: "Number of Inverters",
             type: "number",
             mapping: "system_summary.inverters"
          }
        ]
      },
      {
         title: "Site Details",
         questions: [
            {
               id: "roof_material",
               label: "Roof Material",
               type: "select",
               options: ["Shingle", "Tile", "Metal", "Flat"],
               mapping: "site_details.roof_material"
            },
            {
               id: "roof_pitch",
               label: "Roof Pitch",
               type: "text",
               mapping: "site_details.roof_pitch",
               placeholder: "e.g. 18 degrees"
            }
         ]
      },
      {
          title: "Electrical",
          questions: [
              {
                  id: "main_panel_size",
                  label: "Main Panel Size (Amps)",
                  type: "number",
                  mapping: "electrical_details.main_panel_size"
              },
               {
                  id: "utility_provider",
                  label: "Utility Provider",
                  type: "text",
                  mapping: "site_details.utility_provider"
              }
          ]
      }
    ]
  },
  {
      id: "battery",
      name: "Battery",
      description: "Energy storage system details",
      steps: [
          {
              title: "Battery Configuration",
              questions: [
                   {
                      id: "battery_qty",
                      label: "Quantity",
                      type: "number",
                      required: true,
                      mapping: "system_summary.battery_info.qty"
                   },
                   {
                       id: "battery_model",
                       label: "Battery Model",
                       type: "text",
                       required: true,
                       mapping: "system_summary.battery_info.model"
                   }
              ]
          },
          {
              title: "Installation Details",
              questions: [
                   {
                       id: "battery_location",
                       label: "Installation Location",
                       type: "select",
                       options: ["Garage", "Outside Wall", "Inside Utility Room"],
                       // No mapping effectively means it goes to service_answers or custom field
                       required: true
                   },
                    {
                       id: "backup_type",
                       label: "Backup Type",
                       type: "select",
                       options: ["Whole Home", "Critical Loads"],
                       required: true
                   }
              ]
          }
      ]
  },
   {
      id: "mpu",
      name: "Main Panel Upgrade",
      description: "Upgrade existing electrical panel",
      steps: [
          {
              title: "Existing Panel",
              questions: [
                  {
                      id: "existing_panel_rating",
                      label: "Existing Bus Rating",
                      type: "number",
                       mapping: "electrical_details.bus_rating"
                  },
                  {
                      id: "existing_main_breaker",
                      label: "Existing Main Breaker",
                      type: "number",
                      mapping: "electrical_details.main_breaker"
                  }
              ]
          },
          {
              title: "New Panel Spec",
              questions: [
                  {
                      id: "new_panel_size", // This might map to same field, but usually upgrading means changing it.
                      // For now, let's assume it updates the main_panel_size field
                      label: "New Panel Size",
                      type: "number",
                      mapping: "electrical_details.main_panel_size",
                       required: true
                  },
                  {
                      id: "relocation_required",
                      label: "Is panel being relocated?",
                      type: "boolean"
                  }
              ]
          }
      ]
  }
];
