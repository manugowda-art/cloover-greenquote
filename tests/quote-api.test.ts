import { beforeEach, describe, expect, it, vi } from "vitest";

import { Role } from "@/generated/prisma/client";

const requireUserMock = vi.fn();
const findUniqueMock = vi.fn();

vi.mock("@/lib/auth", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/lib/db", () => ({
  db: {
    quote: {
      findUnique: findUniqueMock,
    },
  },
}));

describe("GET /api/quotes/:id authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when user tries to access another user's quote", async () => {
    requireUserMock.mockResolvedValue({
      userId: 1,
      email: "user@example.com",
      role: Role.USER,
    });

    findUniqueMock.mockResolvedValue({
      id: 10,
      userId: 2,
      address: "Test",
      monthlyConsumptionKwh: 400,
      systemSizeKw: 5,
      downPayment: null,
      systemPrice: 6000,
      riskBand: "A",
      offersJson: "[]",
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 2,
        fullName: "Other User",
        email: "other@example.com",
      },
    });

    const { GET } = await import(
      "@/app/api/quotes/[id]/route"
    );

    const response = await GET(
      new Request("http://localhost/api/quotes/10"),
      {
        params: Promise.resolve({
          id: "10",
        }),
      }
    );

    expect(response.status).toBe(403);
  });

  it("allows owner to fetch quote", async () => {
    requireUserMock.mockResolvedValue({
      userId: 1,
      email: "user@example.com",
      role: Role.USER,
    });

    findUniqueMock.mockResolvedValue({
      id: 10,
      userId: 1,
      address: "Test",
      monthlyConsumptionKwh: 400,
      systemSizeKw: 5,
      downPayment: null,
      systemPrice: 6000,
      riskBand: "A",
      offersJson: "[]",
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 1,
        fullName: "Test User",
        email: "user@example.com",
      },
    });

    const { GET } = await import(
      "@/app/api/quotes/[id]/route"
    );

    const response = await GET(
      new Request("http://localhost/api/quotes/10"),
      {
        params: Promise.resolve({
          id: "10",
        }),
      }
    );

    expect(response.status).toBe(200);
  });

  it("allows admin to fetch another user's quote", async () => {
    requireUserMock.mockResolvedValue({
      userId: 999,
      email: "admin@test.com",
      role: Role.ADMIN,
    });

    findUniqueMock.mockResolvedValue({
      id: 10,
      userId: 2,
      address: "Test",
      monthlyConsumptionKwh: 400,
      systemSizeKw: 5,
      downPayment: null,
      systemPrice: 6000,
      riskBand: "A",
      offersJson: "[]",
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 2,
        fullName: "Other User",
        email: "other@example.com",
      },
    });

    const { GET } = await import(
      "@/app/api/quotes/[id]/route"
    );

    const response = await GET(
      new Request("http://localhost/api/quotes/10"),
      {
        params: Promise.resolve({
          id: "10",
        }),
      }
    );

    expect(response.status).toBe(200);
  });

  it("returns 404 for missing quote", async () => {
    requireUserMock.mockResolvedValue({
      userId: 1,
      email: "user@example.com",
      role: Role.USER,
    });

    findUniqueMock.mockResolvedValue(null);

    const { GET } = await import(
      "@/app/api/quotes/[id]/route"
    );

    const response = await GET(
      new Request("http://localhost/api/quotes/999"),
      {
        params: Promise.resolve({
          id: "999",
        }),
      }
    );

    expect(response.status).toBe(404);
  });
});