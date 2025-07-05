import React from "react";
import { ArrowLeft } from "lucide-react";

import MenuItemsForm from "@/features/menu-items/components/menu-items-form";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/page-header";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add New Menu Item",
  description: "Create a new menu item for your restaurant",
};

const AddMenuItemPage = async ({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) => {
  const { subdomain } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Menu Item"
        description="Create a new menu item for your restaurant"
      >
        <Link href={`/${subdomain}/items`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Items
          </Button>
        </Link>
      </PageHeader>

      <MenuItemsForm />
    </div>
  );
};

export default AddMenuItemPage;
