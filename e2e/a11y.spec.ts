import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Entrance animations fade text in from opacity 0, and axe measures the composited
 * colour of whatever is on screen at that instant. Wait for every finite animation to
 * finish first - looping ones (the scroll cue) never settle, so they are excluded.
 */
async function settleAnimations(page: Page) {
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
      .every((animation) => animation.playState === 'finished'),
  );
}

for (const path of ['/', '/en']) {
  for (const theme of ['dark', 'light'] as const) {
    test(`no accessibility violations on ${path} in ${theme}`, async ({ page }) => {
      await page.goto(path);
      await page.evaluate((value) => {
        document.documentElement.setAttribute('data-theme', value);
      }, theme);
      await settleAnimations(page);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test('all project panels pass the audit when open', async ({ page }) => {
  await page.goto('/');
  for (const trigger of await page.getByTestId('project-row').getByRole('button').all()) {
    await trigger.click();
  }
  await settleAnimations(page);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations).toEqual([]);
});

test('keyboard traversal reaches every interactive element in order', async ({ page }) => {
  await page.goto('/');
  const reached: string[] = [];
  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press('Tab');
    reached.push(
      await page.evaluate(() => {
        const el = document.activeElement;
        return el ? `${el.tagName}:${(el.textContent ?? '').slice(0, 24).trim()}` : 'none';
      }),
    );
  }
  expect(reached[0]).toContain('Zum Inhalt springen');
  // The trigger is named after the project title, not its id; textContent is truncated to
  // 24 chars above, so match a prefix that survives the cut regardless of index digits.
  expect(reached.some((entry) => entry.includes('Mixture-of-Expert'))).toBeTruthy();
});
