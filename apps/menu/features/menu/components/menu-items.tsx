"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMenuItemsQueryOptions } from "../use-menu-api";
import MenuItemCard from "./card";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const MenuItems = ({ slug }: { slug: string }) => {
  const searchParams = useSearchParams();
  const calorieMins = searchParams.get("calorieMins")?.split(",").map(Number);
  const calorieMaxes = searchParams.get("calorieMaxes")?.split(",").map(Number);
  const spices = searchParams.get("spices")?.split(",");
  const vegTypesArray = searchParams.get("vegTypesArray")?.split(",");
  const { data, refetch } = useSuspenseQuery(
    useMenuItemsQueryOptions({
      slug,
      calorieMins,
      calorieMaxes,
      spices,
      vegTypesArray,
    })
  );

  useEffect(() => {
    refetch();
  }, [searchParams]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {data?.items.map((item) => (
          <MenuItemCard key={item.id} item={item} currency={data.currency} />
        ))}
      </div>
    </>
  );
};
