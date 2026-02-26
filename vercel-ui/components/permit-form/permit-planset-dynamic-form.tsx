"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  DynamicFormEngine,
  DynamicFormEngineHandle,
} from "@/components/forms/dynamic-form-engine";
import { Question, SiteFullData } from "@/types/site-centric";
import { ClipboardList, Loader2 } from "lucide-react";
import { fetchSiteData } from "@/app/actions/site-api";
import {
  scrapeAHJAction,
  scrapeUtilityAction,
} from "@/app/actions/scrape-service";
import { geocodeAddress } from "@/app/actions/weather-service";

interface PermitPlansetDynamicFormProps {
  siteUuid?: string;
  projectUuid?: string;
}

export default function PermitPlansetDynamicForm({
  siteUuid,
  projectUuid,
}: PermitPlansetDynamicFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [siteData, setSiteData] = useState<SiteFullData | null>(null);
  const [isLoadingSite, setIsLoadingSite] = useState(false);
  const [prefilledValues, setPrefilledValues] = useState<Record<string, any>>(
    {},
  );
  const [modulePower, setModulePower] = useState<number | null>(null);
  const engineRef = useRef<DynamicFormEngineHandle>(null);

  // Fetch Site Data & Automate Lookups
  useEffect(() => {
    async function initForm() {
      if (!siteUuid) return;

      setIsLoadingSite(true);
      try {
        const res = await fetchSiteData(siteUuid);
        if (res.status === "success" && res.data) {
          const site = res.data;
          setSiteData(site);

          const defaults: Record<string, any> = {
            project_name: site.name,
            address: site.address,
            project_type: site.projectType || "residential",
            system_size: site.answers?.system_size,
            has_battery_backup:
              site.answers?.has_battery_backup === true
                ? "yes"
                : site.answers?.has_battery_backup === false
                  ? "no"
                  : undefined,
            system_type: site.answers?.system_type || "roof_mount",
          };

          setPrefilledValues(defaults);

          // Automated Lookups if missing
          if (site.address && site.address.length > 5) {
            console.log(
              "[PermitPlanset] Triggering automated lookups for:",
              site.address,
            );

            const geo = await geocodeAddress(site.address);
            if (geo.success && geo.lat && geo.lng) {
              // Trigger in parallel
              const [ahjRes, utilRes] = await Promise.all([
                scrapeAHJAction(geo.lat, geo.lng),
                scrapeUtilityAction(geo.lat, geo.lng),
              ]);

              if (ahjRes.success) {
                defaults.jurisdiction = ahjRes.data?.jurisdiction;
              }
              if (utilRes.success) {
                defaults.utility_provider = utilRes.data?.utilityName;
              }

              setPrefilledValues({ ...defaults });
            }
          }
        }
      } catch (error) {
        console.error("Failed to load site data:", error);
      } finally {
        setIsLoadingSite(false);
      }
    }

    initForm();
  }, [siteUuid]);

  // Question Bank Configuration
  const allQuestions: Question[] = useMemo(
    () => [
      // --- GROUP 1: PROJECT CONTEXT (Mostly hidden/pre-filled) ---
      {
        id: 1,
        key: "project_name",
        label: "Project Name",
        inputType: "char",
        isRequired: true,
        categoryName: "Project Context",
        categoryId: "group_1",
        sequence: 1,
      },
      {
        id: 2,
        key: "address",
        label: "Project Address",
        inputType: "char",
        isRequired: true,
        categoryName: "Project Context",
        categoryId: "group_1",
        sequence: 2,
      },
      {
        id: 3,
        key: "project_type",
        label: "Project Type",
        inputType: "select",
        isRequired: true,
        categoryName: "Project Context",
        categoryId: "group_1",
        sequence: 3,
        options: [
          { id: 31, value: "residential", label: "Residential" },
          { id: 32, value: "commercial", label: "Commercial" },
        ],
      },
      {
        id: 13,
        key: "system_size",
        label: "System Size (kW)",
        inputType: "number",
        isRequired: true,
        categoryName: "Project Context",
        categoryId: "group_1",
        sequence: 4,
      },

      // --- GROUP 2: CORE EQUIPMENT (Always Show) ---
      {
        id: 59,
        key: "pv_module_product",
        label: "Make/Model of PV modules",
        inputType: "equipment_search",
        isRequired: true,
        categoryName: "Group 2: Core Equipment",
        categoryId: "core_equipment",
        sequence: 20,
        extraData: {
          equipmentType: "solar",
          frequentItems: [
            { label: "Jinko Solar JKM400M-72H" },
            { label: "Canadian Solar CS6K-280M" },
          ],
        },
      },
      {
        id: 15,
        key: "pv_modules_count",
        label: "Number of PV modules",
        inputType: "number",
        isRequired: true,
        categoryName: "Group 2: Core Equipment",
        categoryId: "core_equipment",
        sequence: 21,
      },
      {
        id: 60,
        key: "inverter_product",
        label: "Make/Model of inverters",
        inputType: "equipment_search",
        isRequired: true,
        categoryName: "Group 2: Core Equipment",
        categoryId: "core_equipment",
        sequence: 22,
        extraData: {
          equipmentType: "inverter",
          frequentItems: [
            { label: "Enphase IQ8Plus-72-2-US" },
            { label: "SolarEdge SE7600H-US" },
          ],
        },
      },
      {
        id: 16,
        key: "inverters_count",
        label: "Number of inverters",
        inputType: "number",
        isRequired: true,
        categoryName: "Group 2: Core Equipment",
        categoryId: "core_equipment",
        sequence: 23,
      },
      {
        id: 101,
        key: "optimizer_product",
        label: "Make/Model of DC optimizers",
        inputType: "equipment_search",
        isRequired: false,
        categoryName: "Group 2: Core Equipment",
        categoryId: "core_equipment",
        sequence: 24,
        extraData: {
          equipmentType: "optimizer",
          frequentItems: [
            { label: "SolarEdge P370" },
            { label: "SolarEdge P401" },
          ],
        },
      },
      {
        id: 102,
        key: "optimizers_count",
        label: "Number of optimizers",
        inputType: "number",
        isRequired: false,
        categoryName: "Group 2: Core Equipment",
        categoryId: "core_equipment",
        sequence: 25,
      },
      {
        id: 103,
        key: "disconnect_product",
        label: "AC/DC Disconnect Model",
        inputType: "equipment_search",
        isRequired: false,
        categoryName: "Group 2: Core Equipment",
        categoryId: "core_equipment",
        sequence: 26,
        extraData: {
          equipmentType: "disconnect",
        },
      },
      {
        id: 104,
        key: "disconnects_count",
        label: "Number of disconnects",
        inputType: "number",
        isRequired: false,
        categoryName: "Group 2: Core Equipment",
        categoryId: "core_equipment",
        sequence: 27,
      },
      {
        id: 40,
        key: "has_battery_backup",
        label: "Battery Backup Included?",
        inputType: "select",
        isRequired: true,
        categoryName: "Group 2: Core Equipment",
        categoryId: "core_equipment",
        sequence: 27.5,
        extraData: { fullWidth: true },
        options: [
          { id: 401, value: "yes", label: "Yes" },
          { id: 402, value: "no", label: "No" },
        ],
      },
      {
        id: 41,
        key: "battery_product",
        label: "Battery Make and Model",
        inputType: "equipment_search",
        isRequired: true,
        categoryName: "Group 2: Core Equipment",
        categoryId: "core_equipment",
        condition: "has_battery_backup == 'yes'",
        sequence: 28,
        extraData: {
          equipmentType: "battery",
          frequentItems: [
            { label: "Tesla Powerwall 2" },
            { label: "Enphase IQ Battery 10T" },
          ],
        },
      },
      {
        id: 42,
        key: "battery_qty",
        label: "No. of units (Quantity)",
        inputType: "number",
        isRequired: true,
        categoryName: "Group 2: Core Equipment",
        categoryId: "core_equipment",
        condition: "has_battery_backup == 'yes'",
        sequence: 29,
      },
      {
        id: 43,
        key: "battery_storage_type",
        label: "Storage Type",
        inputType: "select",
        isRequired: true,
        categoryName: "Group 2: Core Equipment",
        categoryId: "core_equipment",
        condition: "has_battery_backup == 'yes'",
        sequence: 29.5,
        extraData: { fullWidth: true },
        options: [
          { id: 431, value: "whole_home", label: "Whole Home" },
          { id: 432, value: "partial", label: "Partial Backup" },
        ],
      },
      {
        id: 100,
        key: "monitoring_devices",
        label: "Monitoring devices",
        inputType: "char",
        isRequired: false,
        categoryName: "Group 2: Core Equipment",
        categoryId: "core_equipment",
        sequence: 29.6,
        placeholder: "e.g. Enphase Envoy, SolarEdge Monitoring",
      },

      // --- GROUP 4: MOUNTING & STRUCTURAL ---
      {
        id: 14,
        key: "system_type",
        label: "System Type",
        inputType: "select",
        isRequired: true,
        categoryName: "Group 4: Mounting & Structural",
        categoryId: "structural",
        sequence: 40,
        options: [
          { id: 141, value: "roof_mount", label: "Roof-mount" },
          { id: 142, value: "ground_mount", label: "Ground-mount" },
        ],
      },
      // Sub-section: ROOF-MOUNT
      {
        id: 201,
        key: "racking_product_roof",
        label: "Racking Make/Model",
        inputType: "equipment_search",
        isRequired: true,
        categoryName: "Group 4: Mounting & Structural",
        categoryId: "structural",
        subCategory: "Roof Specifications",
        condition: "system_type == 'roof_mount'",
        sequence: 41,
        extraData: {
          equipmentType: "racking-roof",
          frequentItems: [
            { label: "Unirac SolarMount" },
            { label: "IronRidge XR100" },
          ],
        },
      },
      {
        id: 202,
        key: "roof_measurements",
        label: "Roof measurements",
        inputType: "char",
        isRequired: true,
        categoryName: "Group 4: Mounting & Structural",
        categoryId: "structural",
        subCategory: "Roof Specifications",
        condition: "system_type == 'roof_mount'",
        sequence: 42,
      },
      {
        id: 203,
        key: "quantity_of_arrays",
        label: "Quantity of arrays",
        inputType: "number",
        isRequired: true,
        categoryName: "Group 4: Mounting & Structural",
        categoryId: "structural",
        subCategory: "Roof Specifications",
        condition: "system_type == 'roof_mount'",
        sequence: 43,
      },
      {
        id: 204,
        key: "roof_pitch",
        label: "Roof pitch",
        inputType: "char",
        isRequired: true,
        categoryName: "Group 4: Mounting & Structural",
        categoryId: "structural",
        subCategory: "Roof Specifications",
        condition: "system_type == 'roof_mount'",
        sequence: 44,
      },
      {
        id: 205,
        key: "roof_type",
        label: "Roof type",
        inputType: "select",
        isRequired: true,
        categoryName: "Group 4: Mounting & Structural",
        categoryId: "structural",
        subCategory: "Roof Specifications",
        condition: "system_type == 'roof_mount'",
        sequence: 45,
        options: [
          {
            id: 2051,
            value: "shingle",
            label: "Asphalt Shingle",
            image: "/asphalt.webp",
          },
          {
            id: 2052,
            value: "metal",
            label: "Metal Roof",
            image: "/standing.jpg",
          },
          { id: 2053, value: "tpo", label: "TPO Roof", image: "/flat.jpg" },
        ],
      },
      {
        id: 2055,
        key: "metal_roof_type",
        label: "Metal Roof Category",
        inputType: "select",
        isRequired: true,
        categoryName: "Group 4: Mounting & Structural",
        categoryId: "structural",
        subCategory: "Roof Specifications",
        condition: "roof_type == 'metal' && system_type == 'roof_mount'",
        sequence: 45.1,
        options: [
          {
            id: 20551,
            value: "standing_seam",
            label: "Standing Seam",
            image: "/standing.jpg",
          },
          {
            id: 20552,
            value: "metal_shingles",
            label: "Metal Shingles",
            image: "/shingle.jpg",
          },
          {
            id: 20553,
            value: "corrugated_metal",
            label: "Corrugated Metal",
            image: "/corruted.jfif",
          },
        ],
      },
      {
        id: 206,
        key: "roof_mount_attachment_type",
        label: "Roof-Mount Attachment Type",
        inputType: "char",
        isRequired: true,
        categoryName: "Group 4: Mounting & Structural",
        categoryId: "structural",
        subCategory: "Roof Specifications",
        condition: "system_type == 'roof_mount'",
        sequence: 46,
      },
      {
        id: 207,
        key: "structure_type_roof",
        label: "Structure Type",
        inputType: "char",
        isRequired: true,
        categoryName: "Group 4: Mounting & Structural",
        categoryId: "structural",
        subCategory: "Roof Specifications",
        condition: "system_type == 'roof_mount'",
        sequence: 47,
        placeholder: "e.g. Truss",
      },
      {
        id: 208,
        key: "rafter_size_spacing",
        label: "Rafter size and spacing",
        inputType: "char",
        isRequired: true,
        categoryName: "Group 4: Mounting & Structural",
        categoryId: "structural",
        subCategory: "Roof Specifications",
        condition: "system_type == 'roof_mount'",
        sequence: 48,
      },
      // Sub-section: GROUND-MOUNT
      {
        id: 301,
        key: "racking_product_ground",
        label: "Ground Mount Racking Make/Model",
        inputType: "equipment_search",
        isRequired: true,
        categoryName: "Group 4: Mounting & Structural",
        categoryId: "structural",
        subCategory: "Ground Mount Specifications",
        condition: "system_type == 'ground_mount'",
        sequence: 51,
        extraData: {
          equipmentType: "racking-ground",
          frequentItems: [
            { label: "IronRidge Ground Mount" },
            { label: "Unirac GFT" },
          ],
        },
      },
      {
        id: 302,
        key: "array_quantity_ground",
        label: "Array Quantity",
        inputType: "number",
        isRequired: true,
        categoryName: "Group 4: Mounting & Structural",
        categoryId: "structural",
        subCategory: "Ground Mount Specifications",
        condition: "system_type == 'ground_mount'",
        sequence: 52,
      },
      {
        id: 303,
        key: "quantity_of_columns",
        label: "Quantity of Columns",
        inputType: "number",
        isRequired: true,
        categoryName: "Group 4: Mounting & Structural",
        categoryId: "structural",
        subCategory: "Ground Mount Specifications",
        condition: "system_type == 'ground_mount'",
        sequence: 53,
      },
      {
        id: 304,
        key: "quantity_of_rows",
        label: "Quantity of Rows",
        inputType: "number",
        isRequired: true,
        categoryName: "Group 4: Mounting & Structural",
        categoryId: "structural",
        subCategory: "Ground Mount Specifications",
        condition: "system_type == 'ground_mount'",
        sequence: 54,
      },
      {
        id: 305,
        key: "front_clearance_ground",
        label: "Front Clearance (Ft)",
        inputType: "number",
        isRequired: true,
        categoryName: "Group 4: Mounting & Structural",
        categoryId: "structural",
        subCategory: "Ground Mount Specifications",
        condition: "system_type == 'ground_mount'",
        sequence: 55,
      },
      {
        id: 306,
        key: "rear_clearance_ground",
        label: "Rear Clearance (Ft)",
        inputType: "number",
        isRequired: true,
        categoryName: "Group 4: Mounting & Structural",
        categoryId: "structural",
        subCategory: "Ground Mount Specifications",
        condition: "system_type == 'ground_mount'",
        sequence: 56,
      },
      {
        id: 307,
        key: "ground_type",
        label: "Ground Type",
        inputType: "char",
        isRequired: true,
        categoryName: "Group 4: Mounting & Structural",
        categoryId: "structural",
        subCategory: "Ground Mount Specifications",
        condition: "system_type == 'ground_mount'",
        sequence: 57,
        placeholder: "e.g. Soil Type",
      },
      {
        id: 308,
        key: "trenching_ft",
        label: "Trenching (Ft)",
        inputType: "char",
        isRequired: true,
        categoryName: "Group 4: Mounting & Structural",
        categoryId: "structural",
        subCategory: "Ground Mount Specifications",
        condition: "system_type == 'ground_mount'",
        sequence: 58,
        placeholder: "Mention wire size and conduit type",
      },

      // --- GROUP 5: ELECTRICAL & INTERCONNECTION ---
      {
        id: 401,
        key: "interconnection_location",
        label: "Interconnection Location",
        inputType: "char",
        isRequired: true,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Interconnection Details",
        sequence: 70,
      },
      {
        id: 402,
        key: "service_voltage_interconnection",
        label: "Service Voltage at Interconnection",
        inputType: "char",
        isRequired: true,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Interconnection Details",
        sequence: 71,
        placeholder: "e.g. 1P 3W 120/240 V",
      },
      {
        id: 403,
        key: "inverter_location_specific",
        label: "Inverter Location",
        inputType: "char",
        isRequired: true,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Interconnection Details",
        sequence: 72,
        placeholder: "e.g. Specific Wall",
      },
      {
        id: 404,
        key: "mep_location_external",
        label: "Main Electrical Panel (MEP) Location",
        inputType: "char",
        isRequired: true,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Interconnection Details",
        sequence: 73,
        placeholder: "e.g. External Wall",
      },
      {
        id: 405,
        key: "internal_mep_orientation",
        label: "Internal MEP Orientation",
        inputType: "char",
        isRequired: true,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Interconnection Details",
        sequence: 74,
        placeholder: "e.g. Basement",
      },
      {
        id: 420,
        key: "service_entrance_type",
        label: "Service Entrance Type",
        inputType: "select",
        isRequired: true,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Interconnection Details",
        sequence: 74.5,
        options: [
          { id: 4201, value: "overhead", label: "Overhead" },
          { id: 4202, value: "underground", label: "Underground" },
        ],
      },
      {
        id: 406,
        key: "mep_main_breaker_rating",
        label: "MEP Main Breaker Rating",
        inputType: "char",
        isRequired: true,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Panel Specifications",
        sequence: 75,
      },
      {
        id: 407,
        key: "mep_main_bus_rating",
        label: "MEP Rating (Main Bus Rating)",
        inputType: "char",
        isRequired: true,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Panel Specifications",
        sequence: 76,
      },
      {
        id: 408,
        key: "breaker_mod_details_upsizing",
        label: "Breaker Upsizing/Downsizing required?",
        inputType: "text",
        isRequired: true,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Panel Specifications",
        sequence: 77,
        placeholder: "If yes, explain why",
      },
      {
        id: 421,
        key: "pv_breaker_location",
        label: "PV Breaker Location",
        inputType: "char",
        isRequired: true,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Panel Specifications",
        sequence: 77.5,
        placeholder: "e.g. MEP Bottom, Subpanel 1",
      },
      {
        id: 409,
        key: "existing_grounding",
        label: "Existing Electrical Grounding",
        inputType: "char",
        isRequired: true,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Panel Specifications",
        sequence: 78,
        placeholder: "e.g. Ground Rod",
      },
      {
        id: 422,
        key: "subpanel_details",
        label: "Subpanel Details",
        inputType: "text",
        isRequired: false,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Panel Specifications",
        sequence: 78.5,
        placeholder: "Describe any subpanels used for interconnection",
      },
      {
        id: 410,
        key: "utility_entrance",
        label: "Utility Entrance",
        inputType: "char",
        isRequired: true,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Utility & Disconnects",
        sequence: 79,
        placeholder: "e.g. Underground",
      },
      {
        id: 411,
        key: "existing_meter_location",
        label: "Existing Meter Location",
        inputType: "char",
        isRequired: true,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Utility & Disconnects",
        sequence: 80,
        placeholder: "e.g. External Wall",
      },
      {
        id: 53,
        key: "pv_revenue_meter",
        label: "PV Revenue Meter",
        inputType: "boolean",
        isRequired: false,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Utility & Disconnects",
        sequence: 81,
      },
      {
        id: 412,
        key: "ac_dc_disconnect_model",
        label: "AC/DC Disconnect Make/Model",
        inputType: "char",
        isRequired: false,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Utility & Disconnects",
        sequence: 82,
      },
      {
        id: 413,
        key: "ac_disconnect_location",
        label: "AC Disconnect Location",
        inputType: "char",
        isRequired: false,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Utility & Disconnects",
        sequence: 83,
      },
      {
        id: 57,
        key: "has_utility_disconnect",
        label: "Utility Disconnect",
        inputType: "boolean",
        isRequired: false,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Utility & Disconnects",
        sequence: 84,
      },
      {
        id: 58,
        key: "utility_disconnect_type",
        label: "Utility Disconnect Type",
        inputType: "select",
        isRequired: true,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Utility & Disconnects",
        condition: "has_utility_disconnect == true",
        sequence: 85,
        options: [
          { id: 571, value: "lever", label: "Lever" },
          { id: 572, value: "pull_out", label: "Pull-out" },
          { id: 573, value: "breaker", label: "Breaker" },
        ],
      },
      {
        id: 414,
        key: "external_utility_disconnect_location",
        label: "External Utility Disconnect Location",
        inputType: "char",
        isRequired: true,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Utility & Disconnects",
        condition: "has_utility_disconnect == true",
        sequence: 86,
      },
      {
        id: 415,
        key: "external_utility_disconnect_id",
        label: "External Utility Disconnect",
        inputType: "char",
        isRequired: true,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Utility & Disconnects",
        condition: "has_utility_disconnect == true",
        sequence: 87,
      },
      {
        id: 416,
        key: "disconnect_orientation",
        label: "Orientation",
        inputType: "char",
        isRequired: true,
        categoryName: "Group 5: Electrical & Interconnection",
        categoryId: "electrical",
        subCategory: "Utility & Disconnects",
        condition: "has_utility_disconnect == true",
        sequence: 88,
        placeholder: "e.g. North",
      },

      // --- GROUP 6: ADDITIONAL INFO ---
      {
        id: 501,
        key: "system_information",
        label: "System Information",
        inputType: "text",
        isRequired: false,
        categoryName: "Group 6: Additional Info",
        categoryId: "additional",
        sequence: 100,
      },
      {
        id: 502,
        key: "additional_notes",
        label: "Additional Notes",
        inputType: "text",
        isRequired: false,
        categoryName: "Group 6: Additional Info",
        categoryId: "additional",
        sequence: 101,
      },
    ],
    [],
  );

  const questions = useMemo(() => {
    // These keys are considered "Project Context" that we already have
    // Also system_size is calculated manually now
    const hiddenKeys = [
      "project_name",
      "address",
      "project_type",
      "system_size",
    ];
    return allQuestions.map((q) => {
      if (hiddenKeys.includes(q.key)) {
        return {
          ...q,
          extraData: { ...q.extraData, hidden: true },
        };
      }
      return q;
    });
  }, [allQuestions]);

  const handleValueChange = (key: string, value: any, extraData?: any) => {
    if (key === "pv_module_product") {
      if (extraData?.power) {
        const powerValue = Number(extraData.power);
        setModulePower(powerValue);
        const currentCount = engineRef.current?.getValues()?.pv_modules_count;
        if (currentCount) {
          const size = (powerValue * Number(currentCount)) / 1000;
          engineRef.current?.setValue(
            "system_size",
            parseFloat(size.toFixed(3)),
          );
        }
      } else {
        setModulePower(null);
      }
    }

    if (key === "pv_modules_count") {
      if (modulePower && value) {
        const size = (modulePower * Number(value)) / 1000;
        engineRef.current?.setValue("system_size", parseFloat(size.toFixed(3)));
      }
    }
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    if (!siteUuid && !projectUuid) {
      toast.error("Context missing (Site/Project UUID)");
      return;
    }

    setIsSubmitting(true);
    try {
      // Choose endpoint based on what we have
      const url = siteUuid
        ? `/api/sites/${siteUuid}/answers`
        : `/api/projects/${projectUuid}/services/1/responses`; // Assume Service ID 1 for Permit Planset

      const payload = siteUuid ? { answers: data } : { responses: data };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save answers");

      toast.success("Permit Planset data saved successfully!");
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to sync data to the cloud.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingSite) {
    return null;
  }

  return (
    <div className="w-full" data-no-loader="true">
      <DynamicFormEngine
        ref={engineRef}
        questions={questions}
        onSubmit={handleFormSubmit}
        onValueChange={handleValueChange}
        isSubmitting={isSubmitting}
        defaultValues={prefilledValues}
      />
    </div>
  );
}
