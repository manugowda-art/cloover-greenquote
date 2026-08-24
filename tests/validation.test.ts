import { describe, expect, it } from "vitest";

import {
  loginSchema,
  registerSchema,
} from "@/lib/validation/auth";

import { quoteSchema } from "@/lib/validation/quote";

describe("registration validation", () => {
  it("accepts valid registration", () => {
    const result = registerSchema.safeParse({
      fullName: "John Doe",
      email: "john@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      fullName: "John Doe",
      email: "invalid-email",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      fullName: "John Doe",
      email: "john@example.com",
      password: "123",
    });

    expect(result.success).toBe(false);
  });
});

describe("login validation", () => {
  it("accepts email and password", () => {
    const result = loginSchema.safeParse({
      email: "john@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });
});

describe("quote validation", () => {
  it("accepts valid quote input", () => {
    const result = quoteSchema.safeParse({
      address: "123 Green Street",
      monthlyConsumptionKwh: 400,
      systemSizeKw: 5,
      downPayment: 1000,
    });

    expect(result.success).toBe(true);
  });

  it("rejects negative monthly consumption", () => {
    const result = quoteSchema.safeParse({
      address: "123 Green Street",
      monthlyConsumptionKwh: -100,
      systemSizeKw: 5,
    });

    expect(result.success).toBe(false);
  });

  it("rejects zero system size", () => {
    const result = quoteSchema.safeParse({
      address: "123 Green Street",
      monthlyConsumptionKwh: 400,
      systemSizeKw: 0,
    });

    expect(result.success).toBe(false);
  });

  it("rejects negative down payment", () => {
    const result = quoteSchema.safeParse({
      address: "123 Green Street",
      monthlyConsumptionKwh: 400,
      systemSizeKw: 5,
      downPayment: -1,
    });

    expect(result.success).toBe(false);
  });
});