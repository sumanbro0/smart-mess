import { z } from "zod";

export const messFormSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required").optional(),
    address: z.string().min(1, "Address is required").optional(),
    logo: z.string().min(1, "Logo URL is required").optional(),
    currency: z.string().min(1, "Currency is required"),
});

export type MessFormSchema = z.infer<typeof messFormSchema>;
