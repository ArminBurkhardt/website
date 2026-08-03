import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_LOCALE, DEFAULT_THEME, LINKS, SITE_URL } from './site.ts';

test('german is the default locale', () => {
  assert.equal(DEFAULT_LOCALE, 'de');
});

test('light is the default theme', () => {
  assert.equal(DEFAULT_THEME, 'light');
});

test('every external link is an absolute https url', () => {
  for (const [name, href] of Object.entries(LINKS)) {
    const url = new URL(href);
    assert.equal(url.protocol, 'https:', `${name} must be https`);
  }
});

test('no email address is exposed in config', () => {
  assert.doesNotMatch(JSON.stringify({ LINKS, SITE_URL }), /@[a-z0-9-]+\.[a-z]{2,}/i);
});

test('site url is the production domain', () => {
  assert.equal(SITE_URL, 'https://arminburkhardt.com');
});
