"use client";
import {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { useForm, useWatch, Controller, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Save,
  ChevronRight,
  ChevronLeft,
  Info,
  Layout,
  ClipboardList,
  Check,
  Plus,
  Minus,
  Upload,
} from "lucide-react";
import { Question } from "@/types/site-centric";
import { checkCondition } from "@/lib/form-utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { EquipmentSearchSelector } from "@/components/equipment-search-selector";
import React from "react";

interface DynamicFormEngineProps {
  questions: Question[];
  onSubmit: (data: Record<string, any>) => void;
  isSubmitting?: boolean;
  defaultValues?: Record<string, any>;
  onValueChange?: (key: string, value: any, extraData?: any) => void;
}

export interface DynamicFormEngineHandle {
  setValue: (name: string, value: any) => void;
  getValues: () => any;
}

// FormProgressBar removed for seamless integration

export const DynamicFormEngine = forwardRef<
  DynamicFormEngineHandle,
  DynamicFormEngineProps
>(
  (
    { questions, onSubmit, isSubmitting = false, defaultValues, onValueChange },
    ref,
  ) => {
    const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

    // Compute stable default values
    const computedDefaults = useMemo(() => {
      const defaults: Record<string, any> = {};
      questions?.forEach((q) => {
        if (q.inputType === "boolean") defaults[q.key] = false;
        else if (q.inputType === "number") defaults[q.key] = "";
        else defaults[q.key] = "";
      });
      return { ...defaults, ...(defaultValues || {}) };
    }, [questions, defaultValues]);

    // Create Zod Schema dynamically
    const formSchema = useMemo(() => {
      const schemaObject: any = {};
      questions?.forEach((q) => {
        let fieldSchema: any = z.any();

        if (q.inputType === "number") {
          fieldSchema = z.coerce.number();
        } else if (q.inputType === "boolean") {
          fieldSchema = z.boolean();
        } else if (
          q.inputType === "char" ||
          q.inputType === "text" ||
          q.inputType === "select" ||
          q.inputType === "equipment_search" ||
          q.inputType === "multi_select"
        ) {
          fieldSchema =
            q.inputType === "multi_select" ? z.array(z.string()) : z.string();
        }

        if (q.isRequired) {
          if (
            q.inputType === "char" ||
            q.inputType === "text" ||
            q.inputType === "select"
          ) {
            fieldSchema = fieldSchema.min(1, {
              message: `${q.label} is required`,
            });
          } else if (q.inputType === "number") {
            fieldSchema = fieldSchema.refine(
              (val: any) => val !== undefined && val !== null,
              {
                message: `${q.label} is required`,
              },
            );
          }
        } else {
          fieldSchema = fieldSchema.optional();
        }

        schemaObject[q.key] = fieldSchema;
      });
      return z.object(schemaObject);
    }, [questions]);

    const {
      control,
      handleSubmit,
      setValue,
      getValues,
      reset,
      formState: { errors },
    } = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: computedDefaults,
    });

    // Sync defaultValues when they arrive asynchronously
    const isInitializedRef = React.useRef(false);
    const lastResetDefaults = React.useRef<string>("");

    useEffect(() => {
      const defaultsStr = JSON.stringify(computedDefaults);

      // Initial sync or schema change
      if (
        Object.keys(computedDefaults).length > 0 &&
        (!isInitializedRef.current || lastResetDefaults.current !== defaultsStr)
      ) {
        lastResetDefaults.current = defaultsStr;
        isInitializedRef.current = true;
        reset(computedDefaults);
      }
    }, [computedDefaults, reset]);

    useImperativeHandle(ref, () => ({
      setValue: (name: string, value: any) => setValue(name as any, value),
      getValues: () => getValues(),
    }));

    const watchedData = useWatch({ control });

    const RenderField = ({
      q,
      control,
      onValueChange,
      errors,
    }: {
      q: Question;
      control: any;
      onValueChange: any;
      errors: any;
    }) => (
      <Controller
        control={control}
        name={q.key}
        render={({ field }) => (
          <div className="space-y-1.5">
            {/* Label */}
            {q.inputType !== "boolean" && (
              <div className="flex items-center justify-between px-1">
                <label
                  htmlFor={`field-${q.key}`}
                  className="text-[15px] font-black text-zinc-800 flex items-center gap-2"
                >
                  {q.label}
                  {q.isRequired && (
                    <span className="text-primary text-xl leading-none">*</span>
                  )}
                </label>
                {q.description && (
                  <div className="group relative">
                    <Info className="w-4 h-4 text-zinc-300 cursor-help hover:text-primary transition-colors" />
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-zinc-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl leading-relaxed">
                      {q.description}
                      <div className="absolute top-full right-1.5 border-[6px] border-transparent border-t-zinc-900" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Field Rendering */}
            {q.inputType === "char" && (
              <input
                id={`field-${q.key}`}
                type="text"
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                placeholder={
                  q.placeholder || `Enter ${q.label.toLowerCase()}...`
                }
                className="w-full max-w-lg h-10.5 px-4 rounded-2xl border border-zinc-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all text-base outline-none"
              />
            )}

            {q.inputType === "text" && (
              <textarea
                id={`field-${q.key}`}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                placeholder={q.placeholder || "Enter details..."}
                className="w-full max-w-lg px-4 py-3 rounded-2xl border border-zinc-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/30 min-h-[120px] transition-all text-base outline-none resize-y"
              />
            )}

            {q.inputType === "number" && (
              <div className="flex items-center gap-1 w-fit">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-2xl border-zinc-200 bg-white/50 hover:bg-white hover:border-primary/30 transition-all shrink-0 shadow-sm"
                  onClick={() => {
                    const current = Number(field.value) || 0;
                    const next = Math.max(0, current - 1);
                    field.onChange(next);
                    onValueChange?.(q.key, next);
                  }}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <input
                  id={`field-${q.key}`}
                  type="number"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val =
                      e.target.value === "" ? "" : Number(e.target.value);
                    field.onChange(val);
                    onValueChange?.(q.key, val);
                  }}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  placeholder="0"
                  className="w-24 h-11 px-2 rounded-2xl border-2 border-zinc-100 bg-zinc-50/30 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all text-lg text-center outline-none font-black"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-2xl border-zinc-200 bg-white/50 hover:bg-white hover:border-primary/30 transition-all shrink-0 shadow-sm"
                  onClick={() => {
                    const current = Number(field.value) || 0;
                    const next = current + 1;
                    field.onChange(next);
                    onValueChange?.(q.key, next);
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}

            {q.inputType === "select" &&
              (q.options && q.options.length <= 8 ? (
                <div className="flex flex-wrap gap-3 w-fit py-1">
                  {q.options.map((opt: any) => {
                    const isSelected = field.value === opt.value;
                    const hasImage = !!opt.image;

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => field.onChange(opt.value)}
                        className={cn(
                          "flex flex-col rounded-[24px] text-sm font-black transition-all duration-500 border-2 relative overflow-hidden group",
                          hasImage
                            ? "min-h-[110px] min-w-[150px]"
                            : "min-h-[44px] min-w-[120px] items-center justify-center px-6 py-2",
                          isSelected
                            ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-[0.98]"
                            : "bg-white border-zinc-100 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 hover:bg-zinc-50 shadow-sm",
                        )}
                      >
                        {hasImage && (
                          <div className="absolute inset-0 w-full h-full">
                            <img
                              src={opt.image}
                              alt={opt.label}
                              className={cn(
                                "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110",
                                isSelected
                                  ? "opacity-100"
                                  : "opacity-80 grayscale-20 group-hover:grayscale-0 group-hover:opacity-100",
                              )}
                            />
                            {/* Unique Division: Gradient Overlay */}
                            <div
                              className={cn(
                                "absolute inset-0 bg-linear-to-t transition-opacity duration-500",
                                isSelected
                                  ? "from-primary/90 via-primary/40 to-transparent"
                                  : "from-zinc-900/80 via-zinc-900/20 to-transparent opacity-80 group-hover:opacity-60",
                              )}
                            />
                          </div>
                        )}

                        {isSelected && (
                          <motion.div
                            layoutId={`check-${q.key}`}
                            className="absolute top-2 right-2 z-30"
                          >
                            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg border border-primary/10">
                              <Check className="w-3 h-3 text-primary" />
                            </div>
                          </motion.div>
                        )}

                        <div
                          className={cn(
                            "relative z-20 w-full",
                            hasImage
                              ? "mt-auto p-2 bg-white/10 backdrop-blur-md border-t border-white/20"
                              : "",
                          )}
                        >
                          <span
                            className={cn(
                              "text-center block leading-tight",
                              hasImage &&
                                "text-white drop-shadow-md text-[10px] uppercase tracking-widest font-black",
                            )}
                          >
                            {opt.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="relative group max-w-lg">
                  <select
                    id={`field-${q.key}`}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    className="w-full h-11 px-4 rounded-2xl border-2 border-zinc-100 bg-zinc-50/30 focus:bg-white focus:ring-8 focus:ring-primary/5 focus:border-primary/40 transition-all text-base outline-none appearance-none cursor-pointer pr-10 font-bold"
                  >
                    <option value="" disabled>
                      {q.placeholder || "Select an option"}
                    </option>
                    {q.options?.map((opt: any) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-hover:text-primary transition-colors">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              ))}

            {q.inputType === "multi_select" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-1">
                {q.options?.map((opt: any) => {
                  const currentValues = Array.isArray(field.value)
                    ? field.value
                    : [];
                  const isSelected = currentValues.includes(opt.value);

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          field.onChange(
                            currentValues.filter((v) => v !== opt.value),
                          );
                        } else {
                          field.onChange([...currentValues, opt.value]);
                        }
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center min-h-[60px] px-4 py-2 rounded-2xl text-sm font-black transition-all duration-300 border-2 relative",
                        isSelected
                          ? "bg-primary/5 border-primary text-primary shadow-lg shadow-primary/5 scale-[1.02]"
                          : "bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200 hover:text-zinc-700 hover:bg-zinc-50",
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="text-center leading-tight">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {q.inputType === "boolean" && (
              <div
                className={cn(
                  "flex items-center justify-between p-3.5 rounded-[24px] border-2 transition-all group w-fit min-w-[180px] gap-8",
                  field.value
                    ? "bg-primary/5 border-primary/20 shadow-lg shadow-primary/5"
                    : "border-zinc-100 bg-white/40 shadow-sm hover:shadow-md hover:border-zinc-200",
                )}
              >
                <label
                  htmlFor={`switch-${q.key}`}
                  className="space-y-1.5 cursor-pointer flex-1"
                >
                  <span
                    className={cn(
                      "text-[15px] font-black block transition-colors",
                      field.value
                        ? "text-primary"
                        : "text-zinc-800 group-hover:text-zinc-900",
                    )}
                  >
                    {q.label}
                  </span>
                  {q.description && (
                    <p className="text-[11px] font-bold text-zinc-400 leading-tight pr-8">
                      {q.description}
                    </p>
                  )}
                </label>
                <Switch
                  id={`switch-${q.key}`}
                  checked={!!field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    onValueChange?.(q.key, checked);
                  }}
                  className="scale-110"
                />
              </div>
            )}

            {q.inputType === "file" && (
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="flex-1 max-w-lg">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-200 rounded-2xl cursor-pointer bg-white hover:bg-zinc-50 transition-all group overflow-hidden relative">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-zinc-300 group-hover:text-primary transition-colors" />
                        <p className="mb-2 text-sm text-zinc-500">
                          <span className="font-black text-primary">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-zinc-400">
                          {q.extraData?.accept || "IMAGE, PDF (MAX. 10MB)"}
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept={q.extraData?.accept}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file);
                            onValueChange?.(q.key, file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                {field.value && (
                  <div className="flex items-center gap-2 text-primary font-bold text-xs bg-primary/5 w-fit px-3 py-1.5 rounded-full border border-primary/20">
                    <Check className="w-3.5 h-3.5" />
                    {typeof field.value === "string"
                      ? "File uploaded"
                      : field.value.name}
                  </div>
                )}
              </div>
            )}

            {q.inputType === "equipment_search" && (
              <EquipmentSearchSelector
                value={field.value ?? ""}
                apiType={q.extraData?.equipmentType || "solar"}
                onSelect={(val: string, equipmentId?: string) => {
                  field.onChange(val);
                  onValueChange?.(q.key, val, { equipmentId });
                }}
                onSelectFull={(item: any) => {
                  onValueChange?.(q.key, item.display_label, item);
                }}
                placeholder={q.placeholder || `Search ${q.label}...`}
                frequentItems={q.extraData?.frequentItems}
                className="max-w-lg"
              />
            )}

            {errors[q.key] && (
              <p className="text-red-500 text-xs font-bold mt-1 px-1">
                {errors[q.key]?.message as string}
              </p>
            )}
          </div>
        )}
      />
    );

    // Flatten structure into granular "steps" (chunks)
    // Each step is either a subCategory or a category with no subcategories
    const categories = useMemo(() => {
      if (!Array.isArray(questions)) return [];

      const categoryGroups: Record<
        string,
        { name: string; sequence: number; questions: Question[] }
      > = {};

      questions.forEach((q) => {
        const cat = q.category || {
          id: q.categoryId || "general",
          name: q.categoryName || "General Information",
          sequence: q.sequence || 99,
        };

        const key = String(cat.id);
        if (!categoryGroups[key]) {
          categoryGroups[key] = {
            name: cat.name,
            sequence: cat.sequence,
            questions: [],
          };
        }
        categoryGroups[key].questions.push(q);
      });

      const sortedCategories = Object.values(categoryGroups)
        .sort((a, b) => a.sequence - b.sequence)
        .map((cat) => ({
          name: cat.name,
          categoryName: cat.name,
          questions: [...cat.questions].sort(
            (a, b) =>
              (a.priority || a.sequence || 0) - (b.priority || b.sequence || 0),
          ),
        }))
        .filter((cat) => {
          // Only keep categories that have at least one question that is NOT hidden by extraData
          return cat.questions.some((q) => !q.extraData?.hidden);
        });

      return sortedCategories;
    }, [questions]);

    // Safety: Ensure activeCategoryIndex is always in range
    useEffect(() => {
      if (activeCategoryIndex >= categories.length && categories.length > 0) {
        setActiveCategoryIndex(0);
      }
    }, [categories, activeCategoryIndex]);

    if (!Array.isArray(questions) || questions.length === 0) {
      return (
        <div className="p-12 text-center bg-white/50 backdrop-blur-xl rounded-[32px] border border-dashed border-zinc-200">
          <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 mb-2">
            No questions available
          </h3>
          <p className="text-zinc-500">
            There are no technical questions configured for this service yet.
          </p>
        </div>
      );
    }

    const currentCategory = categories[activeCategoryIndex];

    const nextCategory = () => {
      if (activeCategoryIndex < categories.length - 1) {
        setActiveCategoryIndex((prev) => prev + 1);
      }
    };

    const prevCategory = () => {
      if (activeCategoryIndex > 0) {
        setActiveCategoryIndex((prev) => prev - 1);
      }
    };

    const isCurrentCategoryComplete = useMemo(() => {
      if (!currentCategory) return false;
      return currentCategory.questions
        .filter(
          (q: Question) =>
            q.isRequired && checkCondition(q.condition, watchedData),
        )
        .every((q: Question) => {
          const val = watchedData[q.key];
          if (q.inputType === "multi_select") {
            return Array.isArray(val) && val.length > 0;
          }
          return val !== undefined && val !== "" && val !== null;
        });
    }, [currentCategory, watchedData]);

    return (
      <div className="space-y-6">
        {/* Form Category Header */}
        <div className="pb-4 border-b border-zinc-100 mb-1">
          <div className="flex flex-row md:flex-row md:items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center shadow-lg shadow-zinc-900/10">
                <Layout className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-zinc-900 tracking-tight">
                  {currentCategory?.categoryName}
                </h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Step {activeCategoryIndex + 1} of {categories.length} •{" "}
                  {currentCategory?.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategoryIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col gap-y-6 py-1">
                {currentCategory?.questions.map(
                  (q: Question, idx: number, arr: Question[]) => {
                    const isVisible = checkCondition(q.condition, watchedData);
                    if (!isVisible || q.extraData?.hidden) return null;

                    const prevQ = arr[idx - 1];
                    const subCategory = q.subCategory;
                    const prevSubCategory = prevQ?.subCategory;
                    const showDivider =
                      subCategory &&
                      subCategory !== "default" &&
                      subCategory !== prevSubCategory;

                    return (
                      <div key={q.key} className="space-y-4">
                        {showDivider && (
                          <div className="pt-4 pb-2 border-b border-zinc-100 mb-2">
                            <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                              {subCategory}
                            </h4>
                          </div>
                        )}
                        <RenderField
                          q={q}
                          control={control}
                          onValueChange={onValueChange}
                          errors={errors}
                        />
                      </div>
                    );
                  },
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={prevCategory}
                disabled={activeCategoryIndex === 0}
                className="rounded-full px-6 h-11 font-black text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Previous
              </Button>
            </div>

            <div className="flex gap-4">
              {activeCategoryIndex < categories.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextCategory}
                  className={cn(
                    "rounded-full px-8 h-11 font-black shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2",
                    isCurrentCategoryComplete
                      ? "bg-green-500 hover:bg-green-600 text-white shadow-green-200 animate-pulse"
                      : "bg-primary hover:bg-primary/90 shadow-primary/20",
                  )}
                >
                  {activeCategoryIndex === categories.length - 1
                    ? "Review & Complete"
                    : "Next Section"}
                  <ChevronRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "rounded-full px-10 h-11 text-base font-black shadow-2xl group overflow-hidden relative transition-all",
                    isCurrentCategoryComplete && !isSubmitting
                      ? "bg-green-500 hover:bg-green-600 shadow-green-200 animate-pulse"
                      : "shadow-primary/30",
                  )}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Syncing to Core...
                      </>
                    ) : (
                      <>
                        <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        Complete Workflow
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-linear-to-r from-primary via-primary/80 to-primary group-hover:scale-110 transition-transform duration-500" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    );
  },
);

DynamicFormEngine.displayName = "DynamicFormEngine";
