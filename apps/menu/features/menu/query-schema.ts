import { z } from "zod";

export const menuQuerySchema = z.object({
    category: z.string().optional(),
    q: z.string().optional(),
    calorieMins: z.number().optional(),
    calorieMaxes: z.number().optional(),
    spices: z.string().optional(),
    vegTypesArray: z.string().optional(),
});
