import { test, expect } from "@playwright/test";

test.describe("Turnstile Bot Detection Tests", () => {
  test("should load the form with Turnstile widget", async ({ page }) => {
    await page.goto("/");

    // Check if the form is visible
    await expect(page.getByText("Submit Form")).toBeVisible();

    // Check if username input exists
    await expect(page.getByLabel("Username")).toBeVisible();

    // Check if Turnstile widget container is loaded (the widget itself is invisible with interaction-only mode)
    const turnstileContainer = page.locator("#cf-turnstile");
    await expect(turnstileContainer).toBeVisible({ timeout: 10000 });
  });

  test("should detect bot behavior - automated submission without proper interaction", async ({
    page,
  }) => {
    await page.goto("/");

    // Immediately fill and submit without waiting (bot-like behavior)
    await page.getByLabel("Username").fill("botuser");

    // Try to submit immediately without letting Turnstile initialize properly
    await page.getByRole("button", { name: "Submit" }).click();

    // Wait for error response
    await page.waitForTimeout(3000);

    // Should see an error
    const errorMessage = page.locator(
      "text=/Failed to connect to backend|Turnstile Verification Failed|error/i"
    );
    await expect(errorMessage).toBeVisible();
  });

  // test("should prevent rapid automated submissions", async ({ page }) => {
  //   await page.goto("/");

  //   // Try multiple rapid submissions (bot-like behavior)
  //   for (let i = 0; i < 3; i++) {
  //     await page.getByLabel("Username").fill(`botuser${i}`);
  //     await page.getByRole("button", { name: /Submit/ }).click();
  //     await page.waitForTimeout(500); // Very short wait between attempts
  //   }

  //   // Should show some error or be prevented
  //   const errorOrLoading = page.locator(".mt-4.p-3, button:disabled");
  //   await expect(errorOrLoading.first()).toBeVisible({ timeout: 5000 });
  // });
});
