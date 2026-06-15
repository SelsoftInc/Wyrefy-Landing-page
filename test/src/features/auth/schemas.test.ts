import { describe, expect, it } from "vitest";

import {
  codeSchema,
  firstLoginSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  setupPasswordSchema,
  signupSchema,
} from "@/src/features/auth/schemas";

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "password1" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "notanemail", password: "password1" });
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  it("accepts valid signup data", () => {
    const result = signupSchema.safeParse({ email: "a@b.com", password: "Password1!", full_name: "Test User" });
    expect(result.success).toBe(true);
  });

  it("rejects short password", () => {
    const result = signupSchema.safeParse({ email: "a@b.com", password: "short", full_name: "Test User" });
    expect(result.success).toBe(false);
  });

  it("rejects password without number", () => {
    const result = signupSchema.safeParse({ email: "a@b.com", password: "Password!", full_name: "Test User" });
    expect(result.success).toBe(false);
  });

  it("rejects password without symbol", () => {
    const result = signupSchema.safeParse({ email: "a@b.com", password: "Password1", full_name: "Test User" });
    expect(result.success).toBe(false);
  });
});

describe("codeSchema", () => {
  it("accepts valid code", () => {
    const result = codeSchema.safeParse({ email: "a@b.com", code: "123456" });
    expect(result.success).toBe(true);
  });

  it("rejects code that is not 6 digits", () => {
    const result = codeSchema.safeParse({ email: "a@b.com", code: "12345" });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("requires a valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: "" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("rejects passwords that do not match", () => {
    const result = resetPasswordSchema.safeParse({
      token: "abcdefghijklmnopqrstuvwx",
      new_password: "Password1!",
      confirm_password: "Password2!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain("confirm_password");
    }
  });

  it("rejects short token", () => {
    const result = resetPasswordSchema.safeParse({
      token: "short",
      new_password: "Password1!",
      confirm_password: "Password1!",
    });
    expect(result.success).toBe(false);
  });
});

describe("setupPasswordSchema", () => {
  it("requires passwords to match", () => {
    const result = setupPasswordSchema.safeParse({
      new_password: "Password1!",
      confirm_password: "Different1!",
    });
    expect(result.success).toBe(false);
  });
});

describe("firstLoginSchema", () => {
  it("combines code and password fields", () => {
    const result = firstLoginSchema.safeParse({
      email: "a@b.com",
      code: "123456",
      new_password: "Password1!",
    });
    expect(result.success).toBe(true);
  });
});
