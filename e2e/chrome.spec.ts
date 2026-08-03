import { test, expect } from '@playwright/test';

test('the locale toggle is a real link to the other locale', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByTestId('locale-toggle');
  await expect(toggle).toHaveAttribute('href', '/en');
  await toggle.click();
  await expect(page).toHaveURL('/en');
  await expect(page.getByTestId('locale-toggle')).toHaveAttribute('href', '/');
});

test('the active locale is marked for assistive technology', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('locale-current')).toHaveAttribute('aria-current', 'true');
});

test('the section marker follows the scroll position', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('section-marker')).toContainText('Start');
  await page.locator('#projects').scrollIntoViewIfNeeded();
  await expect(page.getByTestId('section-marker')).toContainText('Projekte');
});

test('the progress bar advances as the page scrolls', async ({ page }) => {
  await page.goto('/');
  const read = () =>
    page
      .getByTestId('progress')
      .evaluate((el) => Number(getComputedStyle(el).getPropertyValue('--progress')));
  const atTop = await read();
  await page.locator('#links').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  expect(await read()).toBeGreaterThan(atTop);
});

test('the skip link moves focus to the content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Zum Inhalt springen' })).toBeFocused();
});
