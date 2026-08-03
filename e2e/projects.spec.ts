import { test, expect } from '@playwright/test';

test('all four projects are listed with taglines visible while collapsed', async ({ page }) => {
  await page.goto('/');
  const rows = page.getByTestId('project-row');
  await expect(rows).toHaveCount(4);
  await expect(
    page.getByText('Studentische Initiative für Quantitative Finance und algorithmischen Handel.'),
  ).toBeVisible();
});

test('a row expands and collapses, and its panel leaves the a11y tree when closed', async ({
  page,
}) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: /tiny-moe-llm/ });
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByText(/dichten Backbone im Gemma-Stil/)).toBeHidden();

  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText(/dichten Backbone im Gemma-Stil/)).toBeVisible();

  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByText(/dichten Backbone im Gemma-Stil/)).toBeHidden();
});

test('multiple rows can be open at once', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /tiny-moe-llm/ }).click();
  await page.getByRole('button', { name: /Assist/ }).click();
  await expect(page.getByRole('button', { name: /tiny-moe-llm/ })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await expect(page.getByRole('button', { name: /Assist/ })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
});

test('a project with a repo shows a link, one without shows the pending note', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /mike t-AI-son/ }).click();
  await expect(page.getByRole('link', { name: /Repository/ })).toHaveAttribute(
    'href',
    'https://github.com/ArminBurkhardt/HackTheLaw',
  );

  await page.getByRole('button', { name: /tiny-moe-llm/ }).click();
  await expect(
    page.getByText(
      'Aktuell im Training — das Repository wird veröffentlicht, sobald der Lauf durch ist.',
    ),
  ).toBeVisible();
});

test('rows are operable by keyboard', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: /tiny-moe-llm/ });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
});

test('external project links are safely targeted', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Tübingen Quant Society/ }).click();
  const link = page.getByRole('link', { name: /Website/ });
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);
});
