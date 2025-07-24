import { useMemo } from "react";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs";

export const vegTypes = ["veg", "non-veg"];
export const spicinessLevels = ["low", "medium", "high"];

export const useQueryInfo = () => {
  const [selectedCategory, setSelectedCategory] = useQueryState(
    "category",
    parseAsString.withDefault("all").withOptions({
      shallow: false,
    })
  );
  const [searchItem, setSearchItem] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({
      shallow: false,
    })
  );
  const [calorieMin, setCalorieMin] = useQueryState(
    "calorieMin",
    parseAsInteger.withDefault(0).withOptions({
      shallow: false,
    })
  );
  const [calorieMax, setCalorieMax] = useQueryState(
    "calorieMax",
    parseAsInteger.withDefault(0).withOptions({
      shallow: false,
    })
  );
  const [vegType, setVegType] = useQueryState(
    "vegType",
    parseAsString.withDefault("").withOptions({
      shallow: false,
    })
  );
  const [spiciness, setSpiciness] = useQueryState(
    "spiciness",
    parseAsString.withDefault("").withOptions({
      shallow: false,
    })
  );

  return {
    selectedCategory,
    setSelectedCategory,
    searchItem,
    setSearchItem,
    calorieMin,
    setCalorieMin,
    calorieMax,
    setCalorieMax,
    vegType,
    setVegType,
    spiciness,
    setSpiciness,
  };
};
