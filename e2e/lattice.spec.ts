import { test, expect } from '@playwright/test';

test('the canvas is decorative and hidden from assistive technology', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('lattice')).toHaveAttribute('aria-hidden', 'true');
});

test('the domain labels exist as real text for screen readers', async ({ page }) => {
  await page.goto('/');
  const labels = page.getByTestId('lattice-labels');
  await expect(labels).toContainText('Quant');
  await expect(labels).toContainText('Recht');
});

test('the canvas stays behind the content and never blocks clicks', async ({ page }) => {
  await page.goto('/');
  const events = await page
    .getByTestId('lattice')
    .evaluate((el) => getComputedStyle(el).pointerEvents);
  expect(events).toBe('none');
  await page.getByRole('button', { name: /tiny-moe-llm/ }).click();
  await expect(page.getByRole('button', { name: /tiny-moe-llm/ })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
});

test('under reduced motion the animation loop does not run', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByTestId('lattice')).toHaveAttribute('data-frames', /\d+/);
  const frames = await page.getByTestId('lattice').getAttribute('data-frames');
  await page.waitForTimeout(600);
  const later = await page.getByTestId('lattice').getAttribute('data-frames');
  expect(later).toBe(frames);
  await context.close();
});
