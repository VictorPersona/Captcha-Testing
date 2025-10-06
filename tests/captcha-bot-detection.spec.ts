import { test, expect, type Page, type BrowserContext } from '@playwright/test';

test.describe('CAPTCHA Bot Detection Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should detect bot behavior - rapid form submission without CAPTCHA interaction', async ({ page }) => {
    // Bot behavior: Attempt rapid form submission without solving CAPTCHA
    await page.fill('#username', 'bot-user-rapid');

    // Try to submit immediately without CAPTCHA token
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(2000);

    // Expect either an error or fallback CAPTCHA to appear
    const errorMessage = page.locator('text=/CAPTCHA|token|error/i');
    const fallbackCaptcha = page.locator('iframe[src*="challenges.cloudflare.com"]');

    const hasError = await errorMessage.isVisible().catch(() => false);
    const hasFallback = await fallbackCaptcha.isVisible().catch(() => false);

    expect(hasError || hasFallback).toBeTruthy();
  });

  test('should detect bot behavior - automated script with headless browser', async ({ browser }) => {
    // Create a headless context (typical bot characteristic)
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/121.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    await page.goto('http://localhost:3000');
    await page.fill('#username', 'headless-bot');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    // CAPTCHA should detect headless environment and show challenge
    const hasChallenge = await page.locator('iframe[src*="cloudflare"]').isVisible().catch(() => false);
    const hasError = await page.locator('.text-red-800').isVisible().catch(() => false);

    expect(hasChallenge || hasError).toBeTruthy();

    await context.close();
  });

  test('should detect bot behavior - multiple rapid submissions', async ({ page }) => {
    // Simulate bot making multiple rapid submissions
    const submissions = 5;

    for (let i = 0; i < submissions; i++) {
      await page.fill('#username', `bot-user-${i}`);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(200); // Very short delay between submissions
    }

    // After multiple rapid attempts, CAPTCHA should trigger fallback or block
    await page.waitForTimeout(1000);

    const fallbackCaptcha = page.locator('iframe[src*="challenges.cloudflare.com"]');
    const errorMessage = page.locator('.text-red-800');

    const hasFallback = await fallbackCaptcha.isVisible().catch(() => false);
    const hasError = await errorMessage.isVisible().catch(() => false);

    expect(hasFallback || hasError).toBeTruthy();
  });

  test('should detect bot behavior - no mouse movement or human-like interaction', async ({ page }) => {
    // Bots typically don't simulate mouse movements
    // Fill form without any mouse movement (direct element interaction)
    await page.locator('#username').fill('no-mouse-movement-bot', { force: true });

    // Submit without any human-like delays
    await page.locator('button[type="submit"]').click({ force: true });

    await page.waitForTimeout(2000);

    // Check if CAPTCHA requires additional verification
    const turnstileFrame = page.frameLocator('iframe[src*="turnstile"]').first();
    const challengeVisible = await page.locator('iframe').count() > 0;

    expect(challengeVisible).toBeTruthy();
  });

  test('should detect bot behavior - suspicious user agent', async ({ browser }) => {
    // Create context with bot-like user agent
    const context = await browser.newContext({
      userAgent: 'python-requests/2.28.0',
    });
    const page = await context.newPage();

    await page.goto('http://localhost:3000');
    await page.fill('#username', 'bot-user-agent');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    // CAPTCHA should detect suspicious user agent
    const hasError = await page.locator('.text-red-800').isVisible().catch(() => false);

    expect(hasError).toBeTruthy();

    await context.close();
  });

  test('should detect bot behavior - missing browser features', async ({ browser }) => {
    // Create context without WebGL (bot characteristic)
    const context = await browser.newContext({
      permissions: [],
    });
    const page = await context.newPage();

    // Disable certain browser features that bots typically lack
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => true,
      });
    });

    await page.goto('http://localhost:3000');
    await page.fill('#username', 'no-webgl-bot');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    // CAPTCHA should detect webdriver flag
    const turnstileLoaded = await page.locator('iframe[src*="turnstile"]').count() > 0;

    expect(turnstileLoaded).toBeTruthy();

    await context.close();
  });

  test('should allow human-like behavior - normal interaction with delays', async ({ page }) => {
    // Simulate human-like behavior
    await page.mouse.move(100, 100);
    await page.waitForTimeout(500);

    // Move to username field
    const usernameField = page.locator('#username');
    const box = await usernameField.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(300);
    }

    // Type with human-like delays
    await page.click('#username');
    await page.waitForTimeout(200);
    await page.keyboard.type('human-user', { delay: 100 });

    // Wait before submission (humans think before clicking)
    await page.waitForTimeout(1000);

    // Wait for Turnstile to potentially load a token
    await page.waitForTimeout(2000);

    // Submit
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(3000);

    // Human behavior should either succeed or get a visible CAPTCHA challenge (not blocked)
    const successMessage = page.locator('.text-green-800');
    const fallbackCaptcha = page.locator('iframe[src*="challenges.cloudflare.com"]');
    const submitButton = page.locator('button[type="submit"]');

    const hasSuccess = await successMessage.isVisible().catch(() => false);
    const hasFallback = await fallbackCaptcha.isVisible().catch(() => false);
    const canStillInteract = await submitButton.isEnabled().catch(() => false);

    // One of these should be true for human-like behavior
    expect(hasSuccess || hasFallback || canStillInteract).toBeTruthy();
  });

  test('should detect automated form filling - programmatic value setting', async ({ page }) => {
    // Bots often set values programmatically without triggering proper events
    await page.evaluate(() => {
      const input = document.querySelector('#username') as HTMLInputElement;
      if (input) {
        input.value = 'programmatic-bot';
      }
    });

    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // CAPTCHA should require verification since no proper input events were fired
    const errorOrChallenge = await page.locator('.text-red-800, iframe[src*="turnstile"]').count() > 0;

    expect(errorOrChallenge).toBeTruthy();
  });

  test('should detect timing anomalies - superhuman speed', async ({ page }) => {
    // Fill and submit in superhuman time (< 100ms)
    const startTime = Date.now();

    await page.fill('#username', 'speed-bot');
    await page.click('button[type="submit"]');

    const endTime = Date.now();
    const timeTaken = endTime - startTime;

    // Verify it was done very quickly
    expect(timeTaken).toBeLessThan(500);

    await page.waitForTimeout(2000);

    // CAPTCHA should detect the anomalous timing
    const hasChallenge = await page.locator('iframe, .text-red-800').count() > 0;

    expect(hasChallenge).toBeTruthy();
  });

  test('should verify CAPTCHA widget loads properly', async ({ page }) => {
    // Ensure Turnstile widget is present on the page
    const turnstileWidget = page.locator('iframe[src*="turnstile"], iframe[src*="cloudflare"]');

    // Wait for widget to load
    await page.waitForTimeout(2000);

    const widgetCount = await turnstileWidget.count();

    // Should have at least one CAPTCHA widget
    expect(widgetCount).toBeGreaterThan(0);
  });

  test('should test backend validation without token', async ({ request }) => {
    // Direct API test - submit without CAPTCHA token
    const response = await request.post('http://localhost:8080/api/submit', {
      data: {
        username: 'api-bot',
        token: '', // Empty token
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Should reject submissions without valid token
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should test backend validation with invalid token', async ({ request }) => {
    // Direct API test - submit with fake token
    const response = await request.post('http://localhost:8080/api/submit', {
      data: {
        username: 'api-bot',
        token: 'fake-invalid-token-12345',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Should reject submissions with invalid token
    expect(response.ok()).toBeFalsy();

    const body = await response.json();
    expect(body.error).toBeTruthy();
  });
});
