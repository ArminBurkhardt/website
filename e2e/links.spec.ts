import { test, expect } from '@playwright/test';

test('linkedin and github are linked and open safely', async ({ page }) => {
  await page.goto('/');
  const linkedin = page.getByRole('link', { name: 'LinkedIn' });
  const github = page.getByRole('link', { name: 'GitHub' });
  await expect(linkedin).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/armin-burkhardt-b0472a413/',
  );
  await expect(github).toHaveAttribute('href', 'https://github.com/ArminBurkhardt/');
  for (const link of [linkedin, github]) {
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  }
});

test('no email address appears anywhere on either locale', async ({ page }) => {
  for (const path of ['/', '/en']) {
    await page.goto(path);
    const html = await page.content();
    expect(html).not.toMatch(/mailto:/);
    expect(html).not.toMatch(/[a-z0-9._%-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  }
});

test('footer shows the copyright line', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('© 2026 Armin Burkhardt')).toBeVisible();
});
