import { describe, expect, it } from "vitest";

import { calculateQuote } from "@/lib/pricing";

describe("calculateQuote", () => {
  it("calculates system price at 1200 per kW", () => {
    const result = calculateQuote({
      monthlyConsumptionKwh: 400,
      systemSizeKw: 6,
    });

    expect(result.systemPrice).toBe(7200);
  });

  it("assigns risk band A", () => {
    const result = calculateQuote({
      monthlyConsumptionKwh: 400,
      systemSizeKw: 6,
    });

    expect(result.riskBand).toBe("A");
    expect(result.offers[0].apr).toBe(0.069);
  });

  it("assigns risk band B when consumption >= 250", () => {
    const result = calculateQuote({
      monthlyConsumptionKwh: 300,
      systemSizeKw: 8,
    });

    expect(result.riskBand).toBe("B");
    expect(result.offers[0].apr).toBe(0.089);
  });

  it("assigns risk band C", () => {
    const result = calculateQuote({
      monthlyConsumptionKwh: 200,
      systemSizeKw: 5,
    });

    expect(result.riskBand).toBe("C");
    expect(result.offers[0].apr).toBe(0.119);
  });

  it("subtracts down payment from system price", () => {
    const result = calculateQuote({
      monthlyConsumptionKwh: 400,
      systemSizeKw: 5,
      downPayment: 1000,
    });

    expect(result.systemPrice).toBe(6000);
    expect(result.principal).toBe(5000);
  });

  it("returns 5, 10 and 15 year offers", () => {
    const result = calculateQuote({
      monthlyConsumptionKwh: 400,
      systemSizeKw: 5,
    });

    expect(result.offers.map((offer) => offer.termYears)).toEqual([
      5, 10, 15,
    ]);
  });

  it("monthly payment decreases for longer terms", () => {
    const result = calculateQuote({
      monthlyConsumptionKwh: 400,
      systemSizeKw: 5,
    });

    expect(result.offers[0].monthlyPayment).toBeGreaterThan(
      result.offers[1].monthlyPayment
    );

    expect(result.offers[1].monthlyPayment).toBeGreaterThan(
      result.offers[2].monthlyPayment
    );
  });

  it("uses the same principal and APR for all terms", () => {
    const result = calculateQuote({
      monthlyConsumptionKwh: 300,
      systemSizeKw: 8,
      downPayment: 500,
    });

    const principals = result.offers.map((offer) => offer.principalUsed);
    const aprs = result.offers.map((offer) => offer.apr);

    expect(new Set(principals).size).toBe(1);
    expect(new Set(aprs).size).toBe(1);
  });
});