"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Flame, Leaf, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useQueryState,
  parseAsArrayOf,
  parseAsInteger,
  parseAsStringLiteral,
} from "nuqs";
import Link from "next/link";

interface PreferencesProps {
  className?: string;
}

const Preferences: React.FC<PreferencesProps> = ({ className }) => {
  const [calorieMins, setCalorieMins] = useQueryState(
    "calorieMins",
    parseAsArrayOf(parseAsInteger).withDefault([])
  );

  const [calorieMaxes, setCalorieMaxes] = useQueryState(
    "calorieMaxes",
    parseAsArrayOf(parseAsInteger).withDefault([])
  );

  const vegTypes = ["veg", "non-veg"] as const;

  const spicinessLevels = ["low", "medium", "high"] as const;
  const [spices, setSpices] = useQueryState(
    "spices",
    parseAsArrayOf(parseAsStringLiteral(spicinessLevels)).withDefault([])
  );

  const [vegTypesArray, setVegTypesArray] = useQueryState(
    "vegTypesArray",
    parseAsArrayOf(parseAsStringLiteral(vegTypes)).withDefault([])
  );

  const [localCalorieMin, setLocalCalorieMin] = useState<string>("");
  const [localCalorieMax, setLocalCalorieMax] = useState<string>("");
  const [localVegType, setLocalVegType] = useState<"veg" | "non-veg">("veg");
  const [localSpiciness, setLocalSpiciness] = useState<
    "low" | "medium" | "high"
  >("medium");

  useEffect(() => {
    setLocalCalorieMin("");
    setLocalCalorieMax("");
    setLocalVegType("veg");
    setLocalSpiciness("medium");
  }, []);

  const getSpicinessValue = (level: string): number => {
    switch (level) {
      case "low":
        return 0;
      case "medium":
        return 0.5;
      case "high":
        return 1;
      default:
        return 0.5;
    }
  };

  const getSpicinessIcon = (level: string) => {
    const flames = level === "low" ? 1 : level === "medium" ? 2 : 3;
    return Array.from({ length: flames }, (_, i) => (
      <Flame key={i} className="w-3 h-3" />
    ));
  };

  const handleSave = () => {
    const newCalorieMin = parseInt(localCalorieMin) || 0;
    const newCalorieMax = parseInt(localCalorieMax) || 1000;
    setCalorieMins([...(calorieMins || []), newCalorieMin]);
    setCalorieMaxes([...(calorieMaxes || []), newCalorieMax]);
    setSpices([...(spices || []), localSpiciness]);
    setVegTypesArray([...(vegTypesArray || []), localVegType]);

    setLocalCalorieMin("");
    setLocalCalorieMax("");
    setLocalSpiciness("medium");
  };

  const handleClearEntry = (index: number) => {
    const newCalorieMins = calorieMins?.filter((_, i) => i !== index) || [];
    const newCalorieMaxes = calorieMaxes?.filter((_, i) => i !== index) || [];
    const newSpices = spices?.filter((_, i) => i !== index) || [];
    const newVegTypes = vegTypesArray?.filter((_, i) => i !== index) || [];

    setCalorieMins(newCalorieMins);
    setCalorieMaxes(newCalorieMaxes);
    setSpices(newSpices);
    setVegTypesArray(newVegTypes);
  };

  const preferenceHistory = [];
  const maxLength = Math.max(
    calorieMins?.length || 0,
    calorieMaxes?.length || 0,
    spices?.length || 0,
    vegTypesArray?.length || 0
  );

  for (let i = 0; i < maxLength; i++) {
    const preference = {
      id: i,
      preferred_calories: {
        min: calorieMins?.[i] || 0,
        max: calorieMaxes?.[i] || 1000,
      },
      preferred_spiciness: getSpicinessValue(spices?.[i] || "medium"),
      vegetarian_only: vegTypesArray?.[i] === "veg",
      spiciness_level: spices?.[i] || "medium",
      veg_type: vegTypesArray?.[i] || "veg",
    };
    preferenceHistory.push(preference);
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Calorie Range (per meal)
          </Label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="calorie-min" className="text-xs text-slate-600">
                Min Calories
              </Label>
              <Input
                id="calorie-min"
                type="number"
                placeholder="200"
                value={localCalorieMin}
                onChange={(e) => setLocalCalorieMin(e.target.value)}
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
                value={localCalorieMax}
                onChange={(e) => setLocalCalorieMax(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Dietary Preference</Label>
          <RadioGroup
            value={localVegType}
            onValueChange={(value) =>
              setLocalVegType(value as "veg" | "non-veg")
            }
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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
                <Label htmlFor="non-veg" className="text-sm">
                  Non-Vegetarian
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Spiciness Level</Label>
          <RadioGroup
            value={localSpiciness}
            onValueChange={(value) =>
              setLocalSpiciness(value as "low" | "medium" | "high")
            }
          >
            <div className="flex flex-col gap-2">
              {spicinessLevels.map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <RadioGroupItem value={level} id={level} />
                  <Label
                    htmlFor={level}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border transition-colors text-sm",
                      localSpiciness === level
                        ? "bg-slate-100 border-slate-300"
                        : "border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex gap-0.5">
                      {getSpicinessIcon(level)}
                    </div>
                    <span className="capitalize">{level}</span>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleSave}
            className="w-full sm:h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-sm sm:text-base"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 sm:h-10 text-sm sm:text-base"
            asChild
          >
            <Link href={""}>Recommend</Link>
          </Button>
        </div>

        {(calorieMins?.length > 0 ||
          calorieMaxes?.length > 0 ||
          spices?.length > 0 ||
          vegTypesArray?.length > 0) && (
          <div className="mt-6 p-4 border rounded-lg bg-slate-50">
            {" "}
            <h3 className="text-sm font-medium mb-3">
              Saved Preferences History
            </h3>
            <div className="space-y-2 text-xs">
              {" "}
              <div>
                <span className="text-slate-600">Calorie Mins:</span>
                <span className="ml-2 font-mono">
                  {calorieMins?.join(", ") || "None"}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Calorie Maxes:</span>
                <span className="ml-2 font-mono">
                  {calorieMaxes?.join(", ") || "None"}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Spices:</span>
                <span className="ml-2 font-mono">
                  {spices?.join(", ") || "None"}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Veg/Non-Veg:</span>
                <span className="ml-2 font-mono">
                  {vegTypesArray?.join(", ") || "None"}
                </span>
              </div>
            </div>
          </div>
        )}

        {preferenceHistory.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-medium">
              Individual Preference History
            </h3>
            <div className="space-y-3">
              {preferenceHistory.map((preference, index) => (
                <div
                  key={preference.id}
                  className="p-4 border rounded-lg bg-white relative"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-medium text-slate-600">
                      Entry #{index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClearEntry(index)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <pre className="text-xs bg-slate-50 p-3 rounded border overflow-x-auto">
                    {JSON.stringify(preference, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preferences;
