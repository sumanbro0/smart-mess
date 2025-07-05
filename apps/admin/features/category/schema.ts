import { z } from "zod";


export const menuItemCategorySchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string(),
    image: z.string().optional(),
    slug: z.string(),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
    mess_id: z.string().uuid().optional(),
});

export type MenuItemCategoryType = z.infer<typeof menuItemCategorySchema>;

