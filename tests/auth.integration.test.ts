import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";

const findUniqueMock = vi.fn();
const createMock = vi.fn();
const createSessionMock = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: findUniqueMock,
      create: createMock,
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  createSession: createSessionMock,
}));

describe("auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("registers a new user", async () => {
      findUniqueMock.mockResolvedValue(null);

      createMock.mockResolvedValue({
        id: 1,
        fullName: "John Doe",
        email: "john@example.com",
        passwordHash: "hashed",
        role: "USER",
      });

      const { POST } = await import("@/app/api/auth/register/route");

      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: "John Doe",
          email: "john@example.com",
          password: "password123",
        }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.user.email).toBe("john@example.com");
      expect(body.user.passwordHash).toBeUndefined();

      expect(createSessionMock).toHaveBeenCalledOnce();
    });

    it("rejects duplicate email", async () => {
      findUniqueMock.mockResolvedValue({
        id: 1,
        email: "john@example.com",
      });

      const { POST } = await import("@/app/api/auth/register/route");

      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: "John Doe",
          email: "john@example.com",
          password: "password123",
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(409);
      expect(createMock).not.toHaveBeenCalled();
      expect(createSessionMock).not.toHaveBeenCalled();
    });

    it("rejects invalid registration input", async () => {
      const { POST } = await import("@/app/api/auth/register/route");

      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: "",
          email: "not-an-email",
          password: "123",
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      expect(createMock).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in with valid credentials", async () => {
      const passwordHash = await bcrypt.hash("password123", 12);

      findUniqueMock.mockResolvedValue({
        id: 1,
        fullName: "John Doe",
        email: "john@example.com",
        passwordHash,
        role: "USER",
      });

      const { POST } = await import("@/app/api/auth/login/route");

      const request = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "john@example.com",
          password: "password123",
        }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.user.email).toBe("john@example.com");
      expect(body.user.passwordHash).toBeUndefined();

      expect(createSessionMock).toHaveBeenCalledOnce();
    });

    it("returns same 401 message for unknown email", async () => {
      findUniqueMock.mockResolvedValue(null);

      const { POST } = await import("@/app/api/auth/login/route");

      const request = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "missing@example.com",
          password: "password123",
        }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe("Invalid email or password");
    });

    it("returns same 401 message for wrong password", async () => {
      const passwordHash = await bcrypt.hash("correct-password", 12);

      findUniqueMock.mockResolvedValue({
        id: 1,
        fullName: "John Doe",
        email: "john@example.com",
        passwordHash,
        role: "USER",
      });

      const { POST } = await import("@/app/api/auth/login/route");

      const request = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "john@example.com",
          password: "wrong-password",
        }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe("Invalid email or password");

      expect(createSessionMock).not.toHaveBeenCalled();
    });
  });
});