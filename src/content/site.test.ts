import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dictionaries, getDict } from './site.ts';
import { LOCALES } from './types.ts';

function keyPaths(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => keyPaths(item, `${prefix}[${index}]`));
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      keyPaths(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [prefix];
}

function leafValues(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(leafValues);
  if (value !== null && typeof value === 'object') return Object.values(value).flatMap(leafValues);
  return [String(value)];
}

test('every locale is present', () => {
  for (const locale of LOCALES) assert.ok(dictionaries[locale], `missing ${locale}`);
});

test('locales have identical key trees', () => {
  assert.deepEqual(keyPaths(dictionaries.de).sort(), keyPaths(dictionaries.en).sort());
});

test('no dictionary value is empty', () => {
  for (const locale of LOCALES) {
    for (const value of leafValues(dictionaries[locale])) {
      assert.ok(value.trim().length > 0, `empty value in ${locale}`);
    }
  }
});

test('no email address appears in any dictionary', () => {
  assert.doesNotMatch(JSON.stringify(dictionaries), /[a-z0-9._%-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
});

test('german and english copy actually differ', () => {
  assert.notEqual(dictionaries.de.hero.positioning, dictionaries.en.hero.positioning);
  assert.notEqual(dictionaries.de.intro.body, dictionaries.en.intro.body);
});

test('getDict returns the requested locale', () => {
  assert.equal(getDict('en'), dictionaries.en);
  assert.equal(getDict('de'), dictionaries.de);
});

test('each locale supplies exactly four facts', () => {
  for (const locale of LOCALES) assert.equal(dictionaries[locale].intro.facts.length, 4);
});
