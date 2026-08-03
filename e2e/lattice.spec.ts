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
  // The trigger is named after the project title, not its id.
  const project = page.getByRole('button', { name: /Tiny Mixture-of-Experts LLM/ });
  await project.click();
  await expect(project).toHaveAttribute('aria-expanded', 'true');
});

test('scrolling down sways the lattice and keeps it painting', async ({ page }) => {
  await page.goto('/');
  const lattice = page.getByTestId('lattice');
  await expect(lattice).toHaveAttribute('data-sway', '0.000');

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(lattice).toHaveAttribute('data-sway', '1.000');

  const frames = Number(await lattice.getAttribute('data-frames'));
  await page.waitForTimeout(400);
  expect(Number(await lattice.getAttribute('data-frames'))).toBeGreaterThan(frames);
});

test('under reduced motion the lattice neither animates nor reacts to scroll', async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByTestId('lattice')).toHaveAttribute('data-frames', /\d+/);
  const frames = await page.getByTestId('lattice').getAttribute('data-frames');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(600);
  const later = await page.getByTestId('lattice').getAttribute('data-frames');
  expect(later).toBe(frames);
  await expect(page.getByTestId('lattice')).toHaveAttribute('data-sway', '0.000');
  await context.close();
});
