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
import { allQuestions } from "@/types/Permit-Questions";
import { PermitPlansetDynamicFormProps } from "@/types/PermitPlansetDynamicFormProps";

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
