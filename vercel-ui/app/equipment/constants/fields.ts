import { SUBCOMPONENT_TYPES, RACKING_MANUFACTURERS } from "./index"

export const EQUIPMENT_FIELD_CONFIG: Record<string, { key: string; label: string; placeholder?: string; type?: string; required?: boolean; options?: { key: string; label: string }[] }[]> = {
  solar: [
    { key: "brandName", label: "Brand Name", placeholder: "e.g. Hyundai", required: true },
    { key: "model", label: "Model", placeholder: "e.g. HiN-S380XG(BK)", required: true },
    { key: "power", label: "Power (W)", placeholder: "e.g. 380" },
    { key: "efficiency", label: "Efficiency (%)", placeholder: "e.g. 20.86" },
    { key: "openCircuitVoltage", label: "Open Circuit Voltage (Voc)", placeholder: "e.g. 41.4" },
    { key: "shortCircuitCurrent", label: "Short Circuit Current (Isc)", placeholder: "e.g. 11.6" },
    { key: "maximumPowerVoltage", label: "Max Power Voltage (Vmp)", placeholder: "e.g. 34.6" },
    { key: "maximumPowerCurrent", label: "Max Power Current (Imp)", placeholder: "e.g. 10.99" },
    { key: "temperatureCoefficient", label: "Temp Coefficient", placeholder: "e.g. -0.28" },
    { key: "width", label: "Width", placeholder: "e.g. 40.86" },
    { key: "length", label: "Length", placeholder: "e.g. 69.09" },
  ],
  inverter: [
    { key: "brandName", label: "Brand Name", placeholder: "e.g. SolarEdge", required: true },
    { key: "model", label: "Model", placeholder: "e.g. SE7600H-US", required: true },
    { key: "inverterType", label: "Inverter Type", required: true, options: [
      { key: "string", label: "String Inverter" },
      { key: "micro", label: "Micro Inverter" }
    ]},
    { key: "maxDCPower", label: "Max DC Power (W)", placeholder: "e.g. 11800" },
    { key: "ACOutputPower", label: "AC Output Power (W)", placeholder: "e.g. 7600" },
    { key: "efficiency", label: "Efficiency (%)", placeholder: "e.g. 99" },
    { key: "maxInputCurrent", label: "Max Input Current (A)", placeholder: "e.g. 20.5" },
    { key: "maxOutputCurrent", label: "Max Output Current (A)", placeholder: "e.g. 32" },
    { key: "maxInputVoltage", label: "Max Input Voltage (V)", placeholder: "e.g. 480" },
  ],
  battery: [
    { key: "brandName", label: "Brand Name", placeholder: "e.g. Tesla", required: true },
    { key: "modelName", label: "Model Name", placeholder: "e.g. Powerwall 2", required: true },
    { key: "ratedOutputPower", label: "Rated Output Power (W)", placeholder: "e.g. 5000" },
    { key: "peakPower", label: "Peak Power (W)", placeholder: "e.g. 7000" },
    { key: "usableEnergy", label: "Usable Energy (Wh)", placeholder: "e.g. 13500" },
    { key: "voltageRange", label: "Voltage Range (V)", placeholder: "e.g. 350-450" },
    { key: "outputCurrent", label: "Output Current (A)", placeholder: "e.g. 30" },
    { key: "scalibility", label: "Scalability", placeholder: "e.g. Yes (up to 10)" },
    { key: "insulationType", label: "Insulation Type", placeholder: "e.g. Class I" },
    { key: "rating", label: "Rating", placeholder: "e.g. IP65" },
    { key: "operatingTemprature", label: "Operating Temperature", placeholder: "e.g. -20 to 50" },
    { key: "warranty", label: "Warranty", placeholder: "e.g. 10 Years" },
  ],
  optimizer: [
    { key: "brandName", label: "Brand Name", placeholder: "e.g. SolarEdge", required: true },
    { key: "model", label: "Model", placeholder: "e.g. P400", required: true },
    { key: "inputDCPower", label: "Input DC Power (W)", placeholder: "e.g. 400" },
    { key: "maxInputCurrent", label: "Max Input Current (A)", placeholder: "e.g. 10" },
    { key: "voltageRange", label: "Voltage Range (V)", placeholder: "e.g. 8-60" },
    { key: "maxOutputCurrent", label: "Max Output Current (A)", placeholder: "e.g. 15" },
    { key: "maxOutputVoltage", label: "Max Output Voltage (V)", placeholder: "e.g. 80" },
    { key: "efficiency", label: "Efficiency (%)", placeholder: "e.g. 99.5" },
  ],
  disconnect: [
    { key: "brandName", label: "Brand Name", placeholder: "e.g. Schneider", required: true },
    { key: "model", label: "Model", placeholder: "e.g. DU321", required: true },
    { key: "ratedCurrent", label: "Rated Current (A)", placeholder: "e.g. 30" },
    { key: "maxRatedVoltage", label: "Max Rated Voltage (V)", placeholder: "e.g. 240" },
  ],
  attachment: [
    { key: "model", label: "Model", placeholder: "e.g. QuickMount XV", required: true },
  ],
  "racking-system": [
    { key: "name", label: "System Name", placeholder: "e.g. NXT UMOUNT", required: true },
    { key: "manufacturer", label: "Manufacturer", required: true, options: RACKING_MANUFACTURERS },
    { key: "rackingType", label: "Type", required: true, options: [
      { key: "roof", label: "Roof Mount" },
      { key: "ground", label: "Ground Mount" }
    ]},
    { key: "description", label: "Description", placeholder: "Optional description" },
  ],
  "racking-roof": [
    { key: "rackingSystemId", label: "Racking System", placeholder: "Select Hub", required: true },
    { key: "rackingManufacturer", label: "Manufacturer", required: true, options: RACKING_MANUFACTURERS },
    { key: "rackingModel", label: "Product Model", placeholder: "e.g. 168RLD1", required: true },
    { key: "description", label: "Description", placeholder: "Optional description" },
  ],
  "racking-ground": [
    { key: "rackingSystemId", label: "Racking System", placeholder: "Select Hub", required: true },
    { key: "rackingManufacturer", label: "Manufacturer", required: true, options: RACKING_MANUFACTURERS },
    { key: "rackingModel", label: "Product Model", placeholder: "e.g. GMA-01", required: true },
    { key: "description", label: "Description", placeholder: "Optional description" },
  ],
  "racking-subcomponent": [
    { key: "rackingSystemId", label: "Racking System", placeholder: "Select Hub", required: true },
    { key: "model", label: "Part Number/Model", placeholder: "e.g. AE-END-01", required: true },
    { key: "componentType", label: "Component Type", required: true, options: SUBCOMPONENT_TYPES },
    { key: "description", label: "Description", placeholder: "Optional description" },
  ]
}
