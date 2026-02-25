"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  Briefcase,
  MapPin,
  Home,
  Building2,
  Zap,
  Sun,
  Layers,
  Car,
} from "lucide-react";
import AddressAutocomplete from "../address-autocomplete";
import SolarDocument from "../layout/solar-document";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ProjectContactStepProps {
  formData: any;
  updateField: (field: string, value: any) => void;
  errors: Record<string, string>;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

/* ────────────────────────── Card data ────────────────────────── */

const SYSTEM_TYPE_OPTIONS = [
  {
    value: "roof_mount",
    label: "Roof Mount",
    icon: Home,
  },
  {
    value: "ground_mount",
    label: "Ground Mount",
    icon: Sun,
  },
  {
    value: "car_pool",
    label: "Car Port",
    icon: Car,
  },
  {
    value: "both",
    label: "Roof & Ground",
    icon: Layers,
  },
];

const PROJECT_TYPE_OPTIONS = [
  {
    value: "residential",
    label: "Residential",
    icon: Home,
  },
  {
    value: "commercial",
    label: "Commercial",
    icon: Building2,
  },
];

/* ─────────────────────── Card Selector ─────────────────────── */

interface CardOption {
  value: string;
  label: string;
  description?: string;
  icon: React.ElementType;
}

function CardSelector({
  options,
  selected,
  onSelect,
  cols = 2,
}: {
  options: CardOption[];
  selected: string;
  onSelect: (v: string) => void;
  cols?: 2 | 4;
}) {
  return (
    <div
      className={cn(
        "grid gap-3",
        cols === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2",
      )}
    >
      {options.map(({ value, label, icon: Icon }) => {
        const active = selected === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className={cn(
              "relative flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 text-center transition-all duration-200",
              "hover:border-primary/60 hover:bg-primary/5 hover:shadow-md",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
              active
                ? "border-primary bg-primary/8 shadow-lg shadow-primary/10 scale-[1.02]"
                : "border-zinc-200 bg-zinc-50/40",
            )}
          >
            {/* Checkmark badge */}
            {active && (
              <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
            )}

            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-zinc-100 text-zinc-500",
              )}
            >
              <Icon className="h-5 w-5" />
            </span>

            <span className="text-sm font-bold leading-tight text-foreground">
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ───────────────────────── Main Step ───────────────────────── */

export default function ProjectContactStep({
  formData,
  updateField,
  errors,
  onSubmit,
  isSubmitting = false,
}: ProjectContactStepProps) {
  const lat = formData.latitude ? parseFloat(formData.latitude) : null;
  const lng = formData.longitude ? parseFloat(formData.longitude) : null;

  const contractorInfo = {
    companyName: formData.companyName || "",
    companyLogo: formData.companyLogo || "",
    contactName: formData.contactName || "",
    email: formData.email || "",
    phone: formData.phone || "",
    address: formData.companyAddress || "",
    licenseNo: formData.licenseNo || "",
    hicNo: formData.hicNo || "",
  };

  const projectInfo = {
    customerName: formData.projectName || "",
    address: formData.projectAddress || "",
    systemSize: formData.systemSize || "",
    acSystemSize: formData.acSystemSize || "",
    systemType: formData.systemType || "",
    parcelNumber: formData.parcelNumber || "",
    utilityNo: formData.utilityNo || "",
    projectType: formData.projectType || "",
  };

  const coordinates = { lat, lng };

  return (
    <div className="relative flex items-center justify-center w-full min-h-[950px] py-12 overflow-visible">
      {/* Background Layer */}
      <div
        className="absolute top-1/2 left-1/2 z-0 scale-[1.1] transition-all duration-700 pointer-events-none opacity-100 hidden lg:block"
        style={{
          width: "850px",
          transform: "translate(-32%, -60%) rotate(3deg)",
        }}
      >
        <div className="shadow-[0_40px_120px_rgba(0,0,0,0.5)] border border-zinc-200/50 rounded-sm overflow-hidden">
          <SolarDocument
            contractorInfo={contractorInfo}
            projectInfo={projectInfo}
            coordinates={coordinates}
          />
        </div>
      </div>

      {/* ── Foreground Layer: Centered Form Container ── */}
      <div className="relative z-10 w-full max-w-xl bg-background/95 backdrop-blur-xl rounded-[2.5rem] p-8 lg:p-12 border border-zinc-200/40">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
              Project Information
            </h3>
            <p className="text-muted-foreground text-sm font-medium">
              Complete the fields below to create your permit planset.
            </p>
          </div>

          <div className="space-y-6">
            {/* Project Name */}
            <div className="space-y-2">
              <Label
                htmlFor="projectName"
                className="flex items-center gap-2 text-sm font-bold ml-1"
              >
                <ClipboardList className="w-4 h-4 text-primary" />
                Project Name
              </Label>
              <Input
                id="projectName"
                className="h-14 rounded-2xl border-zinc-200 bg-zinc-50/30 focus:bg-white transition-all focus:ring-4 focus:ring-primary/10 px-5 text-lg"
                placeholder="e.g. Smith Residence Solar"
                value={formData.projectName}
                onChange={(e) => updateField("projectName", e.target.value)}
              />
              {errors.projectName && (
                <p className="text-sm text-destructive font-semibold ml-1">
                  {errors.projectName}
                </p>
              )}
            </div>

            {/* System Type — Card Grid */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-bold ml-1">
                <Zap className="w-4 h-4 text-primary" />
                System Type
              </Label>
              <CardSelector
                options={SYSTEM_TYPE_OPTIONS}
                selected={formData.systemType || ""}
                onSelect={(v) => updateField("systemType", v)}
                cols={4}
              />
              {errors.systemType && (
                <p className="text-sm text-destructive font-semibold ml-1">
                  {errors.systemType}
                </p>
              )}
            </div>

            {/* Project Type — Card Grid */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-bold ml-1">
                <Briefcase className="w-4 h-4 text-primary" />
                Project Type
              </Label>
              <CardSelector
                options={PROJECT_TYPE_OPTIONS}
                selected={formData.projectType || ""}
                onSelect={(v) => updateField("projectType", v)}
                cols={2}
              />
              {errors.projectType && (
                <p className="text-sm text-destructive font-semibold ml-1">
                  {errors.projectType}
                </p>
              )}
            </div>

            {/* Project Location */}
            <div className="space-y-2">
              <Label
                htmlFor="projectAddress"
                className="flex items-center gap-2 text-sm font-bold ml-1"
              >
                <MapPin className="w-4 h-4 text-primary" />
                Project Location
              </Label>

              <AddressAutocomplete
                value={formData.projectAddress}
                onChange={(value) => updateField("projectAddress", value)}
                className="bg-zinc-50/30 h-14 rounded-2xl border-zinc-200 focus:bg-white transition-all px-5 text-lg"
              />

              {errors.projectAddress && (
                <p className="text-sm text-destructive font-semibold ml-1">
                  {errors.projectAddress}
                </p>
              )}
            </div>
          </div>

          {/* Integrated Action Button */}
          <div className="pt-6">
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="w-full h-16 rounded-[1.5rem] text-xl font-bold shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin mr-3" />
                  Creating Project...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
