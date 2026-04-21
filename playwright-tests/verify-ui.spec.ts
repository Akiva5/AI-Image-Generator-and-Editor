import { test, expect } from '@playwright/test';

test('Verify AI Studio UI loads', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Wait for the app to load
  await expect(page.locator('h1')).toContainText('AI Studio');

  // Take a screenshot
  await page.screenshot({ path: 'screenshot-main.png' });

  // Check if suggestion buttons are present
  const suggestions = page.locator('button:has-text("What can I create for you?")');
  // Since h2 has "What can I create for you?", buttons are suggestions
  const suggestionButtons = page.locator('button:has-text("city")');
  await expect(suggestionButtons.first()).toBeVisible();
});
