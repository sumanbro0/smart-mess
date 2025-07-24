"use client";
import React, { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Flame, Leaf, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { spicinessLevels, useQueryInfo } from "../use-query-info";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

const Preferences = ({ className }: { className?: string }) => {
  const {
    setCalorieMax,
    setCalorieMin,
    setSearchItem,
    setSpiciness,
    setVegType,
    searchItem,
    calorieMin,
    calorieMax,
    spiciness,
    vegType,
  } = useQueryInfo();
  const [local, setLocal] = React.useState({
    searchItem: searchItem || "",
    calorieMin: calorieMin || "",
    calorieMax: calorieMax || "",
    vegType: vegType || "",
    spiciness: spiciness || "",
  });
  React.useEffect(() => {
    setLocal({
      searchItem: searchItem || "",
      calorieMin: calorieMin || "",
      calorieMax: calorieMax || "",
      vegType: vegType || "",
      spiciness: spiciness || "",
    });
  }, [searchItem, calorieMin, calorieMax, vegType, spiciness]);
  const debounced = useDebounce(local);
  React.useEffect(() => {
    setSearchItem(debounced.searchItem);
    setCalorieMin(
      debounced.calorieMin === "" ? null : Number(debounced.calorieMin)
    );
    setCalorieMax(
      debounced.calorieMax === "" ? null : Number(debounced.calorieMax)
    );
    setVegType(debounced.vegType === "" ? null : debounced.vegType);
    setSpiciness(debounced.spiciness === "" ? null : debounced.spiciness);
  }, [
    debounced,
    setSearchItem,
    setCalorieMin,
    setCalorieMax,
    setVegType,
    setSpiciness,
  ]);
  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="search-item" className="text-sm font-medium">
              Search Item
            </Label>
            <button
              type="button"
              onClick={() => setLocal((prev) => ({ ...prev, searchItem: "" }))}
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-transparent bg-transparent hover:bg-slate-100 text-slate-600 text-xs transition-colors"
            >
              <X className="w-4 h-4" /> Reset
            </button>
          </div>
          <Input
            id="search-item"
            type="text"
            placeholder="Search by item name..."
            value={local.searchItem}
            onChange={(e) =>
              setLocal((prev) => ({ ...prev, searchItem: e.target.value }))
            }
            className="mt-1"
          />
        </div>
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Calorie Range (per meal)
            </Label>
            <button
              type="button"
              onClick={() =>
                setLocal((prev) => ({
                  ...prev,
                  calorieMin: "",
                  calorieMax: "",
                }))
              }
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-transparent bg-transparent hover:bg-slate-100 text-slate-600 text-xs transition-colors"
            >
              <X className="w-4 h-4" /> Reset
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="calorie-min" className="text-xs text-slate-600">
                Min Calories
              </Label>
              <Input
                id="calorie-min"
                type="number"
                placeholder="200"
                value={local.calorieMin}
                onChange={(e) =>
                  setLocal((prev) => ({ ...prev, calorieMin: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="calorie-max" className="text-xs text-slate-600">
                Max Calories
              </Label>
              <Input
                id="calorie-max"
                type="number"
                placeholder="800"
                value={local.calorieMax}
                onChange={(e) =>
                  setLocal((prev) => ({ ...prev, calorieMax: e.target.value }))
                }
                className="mt-1"
              />
            </div>
          </div>
        </div>
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Dietary Preference</Label>
            <button
              type="button"
              onClick={() => setLocal((prev) => ({ ...prev, vegType: "" }))}
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-transparent bg-transparent hover:bg-slate-100 text-slate-600 text-xs transition-colors"
            >
              <X className="w-4 h-4" /> Reset
            </button>
          </div>
          <RadioGroup
            value={local.vegType}
            onValueChange={(value) =>
              setLocal((prev) => ({ ...prev, vegType: value }))
            }
          >
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="veg" id="veg" />
                <Label
                  htmlFor="veg"
                  className="flex items-center gap-2 text-sm"
                >
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  Vegetarian Only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non-veg" id="non-veg" />
                <Label
                  htmlFor="non-veg"
                  className="flex items-center gap-2 text-sm"
                >
                  Non-Vegetarian
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Spiciness Level</Label>
            <button
              type="button"
              onClick={() => setLocal((prev) => ({ ...prev, spiciness: "" }))}
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-transparent bg-transparent hover:bg-slate-100 text-slate-600 text-xs transition-colors"
            >
              <X className="w-4 h-4" /> Reset
            </button>
          </div>
          <RadioGroup
            value={local.spiciness}
            onValueChange={(value) =>
              setLocal((prev) => ({ ...prev, spiciness: value }))
            }
          >
            <div className="grid grid-cols-2 gap-4">
              {spicinessLevels.map((level) => (
                <div key={level} className="flex items-center space-x-2 w-full">
                  <RadioGroupItem value={level} id={level} />
                  <Label
                    htmlFor={level}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border transition-colors text-sm w-full",
                      local.spiciness === level
                        ? "bg-slate-100 border-slate-300"
                        : "border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex gap-0.5">
                      {Array.from(
                        {
                          length:
                            level === "low"
                              ? 1
                              : level === "medium"
                                ? 2
                                : level === "high"
                                  ? 3
                                  : 0,
                        },
                        (_, i) => (
                          <Flame key={i} className="w-3 h-3" />
                        )
                      )}
                    </div>
                    <span className="capitalize">{level}</span>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      </div>
      <Button
        type="button"
        onClick={() =>
          setLocal({
            searchItem: "",
            calorieMin: "",
            calorieMax: "",
            vegType: "",
            spiciness: "",
          })
        }
        variant="outline"
        className="w-full"
      >
        <X className="w-5 h-5" /> Clear All
      </Button>
    </div>
  );
};

export default Preferences;
