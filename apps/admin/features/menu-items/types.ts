import z from "zod";
import { menuItemSchema, SpicinessLevelEnum } from "./schema";

export type MenuItem = z.infer<typeof menuItemSchema>;
export type SpicinessLevelType = z.infer<typeof SpicinessLevelEnum>


export type { MenuItemDisplayResponse as MenuItemDisplay } from "@/client";