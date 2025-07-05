import { SpicinessEnum } from "@/client/types.gen";
import z from "zod";

export const SpicinessEnumValues: SpicinessEnum[] = ["high", "low", "medium"];
export const SpicinessLevelEnum = z.enum(SpicinessEnumValues as [string, ...string[]]);

export type SpicinessLevelEnum = z.infer<typeof SpicinessLevelEnum>;

export const menuItemSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string(),
    description: z.string().optional(),
    price: z.coerce.number().positive(),
    in_stock: z.boolean(),
    is_active: z.boolean(),
    calories: z.coerce.number().positive().optional(),
    spiciness: SpicinessLevelEnum.optional(),
    is_veg: z.boolean(),
    category_id: z.string().uuid().optional(),
    primary_image: z.string().optional(),
    images: z.array(z.string()).optional(),
});