import { test } from 'node:test';
import assert from 'node:assert/strict';
import { projects } from './projects.ts';
import { DOMAINS } from './types.ts';

test('project ids are unique and slug-safe', () => {
  const ids = projects.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate project id');
  for (const id of ids) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
});

test('every project carries both locales with non-empty copy', () => {
  for (const project of projects) {
    for (const locale of ['de', 'en'] as const) {
      const copy = project[locale];
      assert.ok(copy.title.trim().length > 0, `${project.id}.${locale}.title`);
      assert.ok(copy.tagline.trim().length > 0, `${project.id}.${locale}.tagline`);
      assert.ok(copy.body.trim().length > 0, `${project.id}.${locale}.body`);
      assert.ok(copy.stack.length > 0, `${project.id}.${locale}.stack`);
    }
  }
});

test('stack entries match across locales', () => {
  for (const project of projects) {
    assert.deepEqual(project.de.stack, project.en.stack, `${project.id} stack drift`);
  }
});

test('every declared domain is a known domain', () => {
  for (const project of projects) assert.ok(DOMAINS.includes(project.domain));
});

test('non-null links are absolute https urls', () => {
  for (const project of projects) {
    for (const [kind, href] of Object.entries(project.links)) {
      if (href === null) continue;
      assert.equal(new URL(href).protocol, 'https:', `${project.id}.${kind}`);
    }
  }
});

test('a wip project with no links supplies a pending note in both locales', () => {
  for (const project of projects) {
    const hasLink = project.links.repo !== null || project.links.site !== null;
    if (project.status === 'wip' && !hasLink) {
      assert.ok(project.de.pendingNote, `${project.id}.de.pendingNote missing`);
      assert.ok(project.en.pendingNote, `${project.id}.en.pendingNote missing`);
    }
  }
});

test('the four expected projects are present in order', () => {
  assert.deepEqual(
    projects.map((p) => p.id),
    ['tqs', 'mike-t-ai-son', 'tiny-moe-llm', 'assist'],
  );
});

test('tiny-moe-llm ships as work in progress without a repo link', () => {
  const moe = projects.find((p) => p.id === 'tiny-moe-llm');
  assert.ok(moe);
  assert.equal(moe.status, 'wip');
  assert.equal(moe.links.repo, null);
});
