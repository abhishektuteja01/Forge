import { z } from "zod";

/** Validate invite-by-email input */
export const inviteByEmailSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .trim()
    .toLowerCase(),
});

/** Validate nudge message */
export const nudgeSchema = z.object({
  message: z.string().min(1, "Message is required").max(200).trim(),
});

export type InviteByEmailData = z.infer<typeof inviteByEmailSchema>;
export type NudgeData = z.infer<typeof nudgeSchema>;
