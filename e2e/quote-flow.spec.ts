import { test, expect } from "@playwright/test";

const testUser = {
  fullName: "E2E User",
  email: "e2e@test.com",
  password: "password123",
};

test("user can sign in, create quote and view result", async ({
  page,
  request,
}) => {
  const registerResponse = await request.post("/api/auth/register", {
    data: testUser,
  });

  expect([201, 409]).toContain(registerResponse.status());

  const input = {
    monthlyConsumptionKwh: 400,
    systemSizeKw: 5,
    downPayment: 1000,
  };

  await page.goto("/login");

  await page.getByLabel("Email").fill(testUser.email);
  await page.getByLabel("Password").fill(testUser.password);
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/quotes$/);

  await page.getByRole("link", { name: /new quote/i }).click();

  await expect(page).toHaveURL(/\/quotes\/new$/);

  await page.getByLabel("Address").fill("123 Green Street");
  await page
    .getByLabel(/Monthly consumption/i)
    .fill(input.monthlyConsumptionKwh.toString());
  await page
    .getByLabel(/System size/i)
    .fill(input.systemSizeKw.toString());
  await page
    .getByLabel(/Down payment/i)
    .fill(input.downPayment.toString());

  await page
    .getByRole("button", { name: /get pre-qualification/i })
    .click();

  await expect(page).toHaveURL(/\/quotes\/\d+$/);

  await expect(
    page.getByRole("heading", { name: /Quote #/ })
  ).toBeVisible();

  await expect(page.getByText("€6,000.00")).toBeVisible();
  await expect(page.getByText("A", { exact: true })).toBeVisible();
  await expect(page.getByText("6.9%")).toBeVisible();

  await expect(
    page.getByRole("row", { name: /^5 years/i })
  ).toContainText("€98.77");

  await expect(
    page.getByRole("row", { name: /^10 years/i })
  ).toContainText("€57.80");

  await expect(
    page.getByRole("row", { name: /^15 years/i })
  ).toContainText("€44.66");
});