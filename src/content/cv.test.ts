import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cv } from './cv.ts';
import { CV_GROUPS } from './types.ts';

test('cv ids are unique and slug-safe', () => {
  const ids = cv.map((entry) => entry.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate cv id');
  for (const id of ids) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
});

test('every cv entry carries both locales with non-empty copy', () => {
  for (const entry of cv) {
    for (const locale of ['de', 'en'] as const) {
      const copy = entry[locale];
      assert.ok(copy.title.trim().length > 0, `${entry.id}.${locale}.title`);
      assert.ok(copy.org.trim().length > 0, `${entry.id}.${locale}.org`);
      assert.ok(copy.period.trim().length > 0, `${entry.id}.${locale}.period`);
    }
  }
});

test('optional cv fields are filled in both locales or neither', () => {
  for (const entry of cv) {
    for (const field of ['mode', 'detail'] as const) {
      assert.equal(
        entry.de[field] === undefined,
        entry.en[field] === undefined,
        `${entry.id}.${field} only in one locale`,
      );
    }
  }
});

test('entries are listed in group order', () => {
  const ranks = cv.map((entry) => CV_GROUPS.indexOf(entry.group));
  assert.ok(!ranks.includes(-1), 'unknown group');
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b));
});

test('a grade sits on the german scale and only on education', () => {
  for (const entry of cv) {
    if (entry.grade === undefined) continue;
    assert.equal(entry.group, 'education', `${entry.id} grade outside education`);
    assert.ok(entry.grade >= 1 && entry.grade <= 4, `${entry.id} grade out of range`);
  }
});

test('the current degree shows its grade', () => {
  assert.ok(cv.some((entry) => entry.group === 'education' && entry.grade !== undefined));
});
