import { z } from "zod";

export const stackSchema = z
  .object({
    anchor_routine_id: z.string().uuid("Invalid anchor routine ID"),
    stacked_routine_id: z.string().uuid("Invalid stacked routine ID"),
    position: z.number().int().nonnegative().optional(),
  })
  .refine((data) => data.anchor_routine_id !== data.stacked_routine_id, {
    message: "A routine cannot be stacked on itself",
    path: ["stacked_routine_id"],
  });

export type StackData = z.infer<typeof stackSchema>;
