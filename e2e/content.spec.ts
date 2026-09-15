import { test, expect } from '@playwright/test';

test('german hero renders name, kicker and positioning', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Armin Burkhardt');
  await expect(page.getByText('Informatikstudent · Tübingen')).toBeVisible();
  await expect(page.getByText(/Ich arbeite an Quantitative Finance/)).toBeVisible();
});

test('english hero renders the translated positioning', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByText(/I work on quantitative finance/)).toBeVisible();
});

test('hero occupies the first viewport', async ({ page }) => {
  await page.goto('/');
  const box = await page.locator('#start').boundingBox();
  const viewport = page.viewportSize();
  expect(box?.height ?? 0).toBeGreaterThan((viewport?.height ?? 0) * 0.8);
});

test('intro renders the label and all four facts', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Über mich' })).toBeVisible();
  const facts = page.getByTestId('fact');
  await expect(facts).toHaveCount(4);
  await expect(page.getByText('B.Sc. Informatik, Universität Tübingen, 2024 - 2027')).toBeVisible();
});

test('english intro uses translated fact labels', async ({ page }) => {
  await page.goto('/en');
  await expect(
    page.getByText('Student Assistant, Institute for Bioinformatics and Medical Informatics (IBMI) Tübingen'),
  ).toBeVisible();
});

test('cv lists every entry and shows the grade in the locale format', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Lebenslauf' })).toBeVisible();
  await expect(page.getByTestId('cv-entry')).toHaveCount(7);
  await expect(page.getByTestId('grade')).toContainText('1,09');

  await page.goto('/en');
  await expect(page.getByTestId('grade')).toContainText('1.09');
  await expect(page.getByTestId('grade').locator('data')).toHaveAttribute('value', '1.09');
});
