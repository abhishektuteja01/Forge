import { z } from "zod";

export const tagEnum = z.enum(["positive", "negative", "neutral"]);
export const timeOfDayEnum = z.enum([
  "morning",
  "afternoon",
  "evening",
  "night",
]);

export const routineSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  tag: tagEnum,
  time_of_day: timeOfDayEnum.optional().nullable(),
});

export type RoutineData = z.infer<typeof routineSchema>;
