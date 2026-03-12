import { describe, it, expect } from "vitest";
import { routineSchema, tagEnum, timeOfDayEnum } from "../routine";
import { identitySchema } from "../identity";
import { stackSchema } from "../stack";
import { loginSchema, signupSchema } from "../auth";
import { inviteByEmailSchema, nudgeSchema } from "../partner";

// ─── routineSchema ───────────────────────────────────────

describe("routineSchema", () => {
  it("accepts valid routine data", () => {
    const result = routineSchema.safeParse({
      name: "Morning coffee",
      tag: "neutral",
      time_of_day: "morning",
    });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from name", () => {
    const result = routineSchema.parse({
      name: "  Journaling  ",
      tag: "positive",
    });
    expect(result.name).toBe("Journaling");
  });

  it("rejects empty name", () => {
    const result = routineSchema.safeParse({
      name: "",
      tag: "positive",
    });
    expect(result.success).toBe(false);
  });

  it("rejects whitespace-only name", () => {
    const result = routineSchema.safeParse({
      name: "   ",
      tag: "positive",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name over 100 characters", () => {
    const result = routineSchema.safeParse({
      name: "a".repeat(101),
      tag: "positive",
    });
    expect(result.success).toBe(false);
  });

  it("accepts name at exactly 100 characters", () => {
    const result = routineSchema.safeParse({
      name: "a".repeat(100),
      tag: "positive",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid tag", () => {
    const result = routineSchema.safeParse({
      name: "Test",
      tag: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid tags", () => {
    for (const tag of ["positive", "negative", "neutral"]) {
      const result = routineSchema.safeParse({ name: "Test", tag });
      expect(result.success).toBe(true);
    }
  });

  it("accepts null time_of_day", () => {
    const result = routineSchema.safeParse({
      name: "Test",
      tag: "positive",
      time_of_day: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts undefined time_of_day", () => {
    const result = routineSchema.safeParse({
      name: "Test",
      tag: "positive",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all valid time_of_day values", () => {
    for (const tod of ["morning", "afternoon", "evening", "night"]) {
      const result = routineSchema.safeParse({
        name: "Test",
        tag: "neutral",
        time_of_day: tod,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid time_of_day", () => {
    const result = routineSchema.safeParse({
      name: "Test",
      tag: "neutral",
      time_of_day: "midnight",
    });
    expect(result.success).toBe(false);
  });
});

describe("tagEnum", () => {
  it("accepts valid tags", () => {
    expect(tagEnum.safeParse("positive").success).toBe(true);
    expect(tagEnum.safeParse("negative").success).toBe(true);
    expect(tagEnum.safeParse("neutral").success).toBe(true);
  });

  it("rejects invalid value", () => {
    expect(tagEnum.safeParse("bad").success).toBe(false);
  });
});

describe("timeOfDayEnum", () => {
  it("accepts valid values", () => {
    for (const v of ["morning", "afternoon", "evening", "night"]) {
      expect(timeOfDayEnum.safeParse(v).success).toBe(true);
    }
  });

  it("rejects invalid value", () => {
    expect(timeOfDayEnum.safeParse("dawn").success).toBe(false);
  });
});

// ─── identitySchema ──────────────────────────────────────

describe("identitySchema", () => {
  it("accepts valid statement", () => {
    const result = identitySchema.safeParse({
      statement: "I am someone who reads daily",
    });
    expect(result.success).toBe(true);
  });

  it("trims whitespace", () => {
    const result = identitySchema.parse({
      statement: "  I am healthy  ",
    });
    expect(result.statement).toBe("I am healthy");
  });

  it("rejects empty statement", () => {
    const result = identitySchema.safeParse({ statement: "" });
    expect(result.success).toBe(false);
  });

  it("rejects whitespace-only statement", () => {
    const result = identitySchema.safeParse({ statement: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects statement over 500 characters", () => {
    const result = identitySchema.safeParse({
      statement: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("accepts statement at exactly 500 characters", () => {
    const result = identitySchema.safeParse({
      statement: "a".repeat(500),
    });
    expect(result.success).toBe(true);
  });
});

// ─── stackSchema ─────────────────────────────────────────

describe("stackSchema", () => {
  const validAnchor = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  const validStacked = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

  it("accepts valid stack data", () => {
    const result = stackSchema.safeParse({
      anchor_routine_id: validAnchor,
      stacked_routine_id: validStacked,
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional position", () => {
    const result = stackSchema.safeParse({
      anchor_routine_id: validAnchor,
      stacked_routine_id: validStacked,
      position: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-UUID anchor_routine_id", () => {
    const result = stackSchema.safeParse({
      anchor_routine_id: "not-a-uuid",
      stacked_routine_id: validStacked,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-UUID stacked_routine_id", () => {
    const result = stackSchema.safeParse({
      anchor_routine_id: validAnchor,
      stacked_routine_id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects self-stacking (same anchor and stacked)", () => {
    const sameId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
    const result = stackSchema.safeParse({
      anchor_routine_id: sameId,
      stacked_routine_id: sameId,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const selfStackError = result.error.issues.find(
        (i) => i.message === "A routine cannot be stacked on itself"
      );
      expect(selfStackError).toBeDefined();
    }
  });

  it("rejects negative position", () => {
    const result = stackSchema.safeParse({
      anchor_routine_id: validAnchor,
      stacked_routine_id: validStacked,
      position: -1,
    });
    expect(result.success).toBe(false);
  });
});

// ─── loginSchema ─────────────────────────────────────────

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("trims email whitespace", () => {
    const result = loginSchema.parse({
      email: "  test@example.com  ",
      password: "password123",
    });
    expect(result.email).toBe("test@example.com");
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

// ─── signupSchema ────────────────────────────────────────

describe("signupSchema", () => {
  it("accepts valid signup data", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects password under 6 characters", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "12345",
      confirmPassword: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password over 72 characters", () => {
    const long = "a".repeat(73);
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: long,
      confirmPassword: long,
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password456",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const mismatchError = result.error.issues.find((i) =>
        i.path.includes("confirmPassword")
      );
      expect(mismatchError).toBeDefined();
    }
  });

  it("accepts password at exactly 6 characters", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "123456",
      confirmPassword: "123456",
    });
    expect(result.success).toBe(true);
  });
});

// ─── inviteByEmailSchema ─────────────────────────────────

describe("inviteByEmailSchema", () => {
  it("accepts valid email", () => {
    const result = inviteByEmailSchema.safeParse({
      email: "friend@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("lowercases email", () => {
    const result = inviteByEmailSchema.parse({
      email: "FRIEND@Example.COM",
    });
    expect(result.email).toBe("friend@example.com");
  });

  it("rejects invalid email", () => {
    const result = inviteByEmailSchema.safeParse({
      email: "not-valid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty email", () => {
    const result = inviteByEmailSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });
});

// ─── nudgeSchema ─────────────────────────────────────────

describe("nudgeSchema", () => {
  it("accepts valid message", () => {
    const result = nudgeSchema.safeParse({
      message: "Keep going! 💪",
    });
    expect(result.success).toBe(true);
  });

  it("trims whitespace", () => {
    const result = nudgeSchema.parse({
      message: "  Stay strong  ",
    });
    expect(result.message).toBe("Stay strong");
  });

  it("rejects empty message", () => {
    const result = nudgeSchema.safeParse({ message: "" });
    expect(result.success).toBe(false);
  });

  it("rejects message over 200 characters", () => {
    const result = nudgeSchema.safeParse({
      message: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("accepts message at exactly 200 characters", () => {
    const result = nudgeSchema.safeParse({
      message: "a".repeat(200),
    });
    expect(result.success).toBe(true);
  });
});
