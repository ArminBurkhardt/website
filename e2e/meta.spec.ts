import { test, expect } from '@playwright/test';

test('sitemap lists both locales', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain('https://arminburkhardt.com');
  expect(body).toContain('https://arminburkhardt.com/en');
});

test('robots allows indexing and points at the sitemap', async ({ request }) => {
  const body = await (await request.get('/robots.txt')).text();
  expect(body).toContain('Allow: /');
  expect(body).toContain('sitemap.xml');
});

test('each locale declares the alternate language', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[hreflang="en"]')).toHaveCount(1);
  await page.goto('/en');
  await expect(page.locator('link[hreflang="de"]')).toHaveCount(1);
});

test('each locale ships its own description', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /Informatikstudent/,
  );
  await page.goto('/en');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /Computer science student/,
  );
});

test('an open graph image is referenced', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
});
