import { z } from "zod";

export const identitySchema = z.object({
  statement: z.string().trim().min(1, "Identity statement is required").max(500, "Statement must be less than 500 characters"),
});

export type IdentityData = z.infer<typeof identitySchema>;
