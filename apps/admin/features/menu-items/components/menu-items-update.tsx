"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
import { getMenuItemQueryOptions } from "../api/use-menu-items";
import { categoryQueryOptions } from "@/features/category/api/use-category-api";
import MenuItemsForm from "./menu-items-form";

const UpdateMenuItem = ({
  subdomain,
  mid,
}: {
  subdomain: string;
  mid: string;
}) => {
  const { data } = useSuspenseQuery(getMenuItemQueryOptions(subdomain, mid));

  return (
    <div>
      <MenuItemsForm
        initialData={{
          in_stock: data.in_stock || false,
          is_active: data.is_active || false,
          is_veg: data.is_veg || false,
          name: data.name || "",
          price: data.price || 0,
          description: data.description || "",
          calories: data.calories || 0,
          spiciness: data.spiciness || "",
          category_id: data.category_id || "",
          images: data.images || [],
          id: data.id,
          primary_image: data.primary_image || "",
        }}
      />
    </div>
  );
};

export default UpdateMenuItem;
