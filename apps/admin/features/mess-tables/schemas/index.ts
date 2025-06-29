import { z } from "zod";

export const tableFormSchema = z.object({
    id: z.string().optional(),
    table_name: z.string().min(1, "Table name is required"),
    capacity: z.coerce
        .number()
        .min(1, "Capacity must be at least 1")
        .max(100, "Capacity cannot exceed 100"),
});

export type TableFormData = z.infer<typeof tableFormSchema>;
