"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
import { getMenuItemsQueryOptions } from "../api/use-menu-items";

import { menuItemColumns, MenuItemDataTable } from "./table";

const MenuItemsList = ({ subdomain }: { subdomain: string }) => {
  const { data } = useSuspenseQuery(getMenuItemsQueryOptions(subdomain));

  return (
    <>
      <MenuItemDataTable columns={menuItemColumns} data={data} />
    </>
  );
};

export default MenuItemsList;
