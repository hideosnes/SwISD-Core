/**
 * 1. Relative path: test/utils.test.ts
 * 2. Description: Unit tests for shared utilities (utils.ts).
 * 3. Expects: node:test runner.
 * 4. Provides: Parsing fallbacks, clamping, freezing, and token entropy guarantees.
 * 5. SPDX-License-Identifier: MPL-2.0
 * 6. Copyright (c) 2026 Homahuki GmbH
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  fnv1aHash,
  safeJsonParse,
  isValidLoadScore,
  clampLoadScore,
  parsePositiveInteger,
  parsePort,
  parseBoolean,
  parsePeerRole,
  createAdminToken,
  deepFreeze,
} from '../src/utils.js';

describe('fnv1aHash', () => {
  it('is deterministic', () => {
    assert.equal(fnv1aHash('swisd'), fnv1aHash('swisd'));
  });

  it('differs for different inputs', () => {
    assert.notEqual(fnv1aHash('a'), fnv1aHash('b'));
  });
});

describe('safeJsonParse', () => {
  it('returns the parsed value when the validator accepts', () => {
    const parsed = safeJsonParse('{"a":1}', (d): d is { a: number } =>
      typeof d === 'object' && d !== null && 'a' in d);
    assert.deepEqual(parsed, { a: 1 });
  });

  it('throws when the JSON is malformed', () => {
    assert.throws(() => safeJsonParse('{broken', (d): d is unknown => true), /Failed to parse or validate/);
  });

  it('throws when the validator rejects', () => {
    assert.throws(() => safeJsonParse('{"a":1}', (d): d is { a: number } => false), /Failed to parse or validate/);
  });
});

describe('load score helpers', () => {
  it('accepts scores in [0,1] and rejects others', () => {
    assert.equal(isValidLoadScore(0), true);
    assert.equal(isValidLoadScore(1), true);
    assert.equal(isValidLoadScore(0.5), true);
    assert.equal(isValidLoadScore(-0.1), false);
    assert.equal(isValidLoadScore(1.1), false);
    assert.equal(isValidLoadScore(Number.NaN), false);
  });

  it('clamps out-of-range scores into [0,1]', () => {
    assert.equal(clampLoadScore(-5), 0);
    assert.equal(clampLoadScore(5), 1);
    assert.equal(clampLoadScore(0.25), 0.25);
  });
});

describe('env parsers', () => {
  it('parsePositiveInteger falls back on garbage and accepts valid input', () => {
    assert.equal(parsePositiveInteger('42', 7), 42);
    assert.equal(parsePositiveInteger('abc', 7), 7);
    assert.equal(parsePositiveInteger('-3', 7), 7);
    assert.equal(parsePositiveInteger('0', 7), 7);
    assert.equal(parsePositiveInteger(undefined, 7), 7);
  });

  it('parsePort falls back outside the valid port range', () => {
    assert.equal(parsePort('8080', 80), 8080);
    assert.equal(parsePort('70000', 80), 80);
    assert.equal(parsePort('0', 80), 80);
    assert.equal(parsePort(undefined, 80), 80);
  });

  it('parseBoolean accepts true/false/1 and falls back otherwise', () => {
    assert.equal(parseBoolean('true', false), true);
    assert.equal(parseBoolean('TRUE', false), true);
    assert.equal(parseBoolean('1', false), true);
    assert.equal(parseBoolean('false', true), false);
    assert.equal(parseBoolean('yes', true), false);
    assert.equal(parseBoolean(undefined, true), true);
  });

  it('parsePeerRole maps known roles and falls back to auto', () => {
    assert.equal(parsePeerRole('worker'), 'worker');
    assert.equal(parsePeerRole('input'), 'input');
    assert.equal(parsePeerRole('diplomat'), 'diplomat');
    assert.equal(parsePeerRole('auto'), 'auto');
    assert.equal(parsePeerRole('WORKER'), 'auto');
    assert.equal(parsePeerRole('bogus'), 'auto');
    assert.equal(parsePeerRole(undefined), 'auto');
  });
});

describe('createAdminToken', () => {
  it('produces long tokens with high entropy', () => {
    const a = createAdminToken();
    const b = createAdminToken();
    assert.notEqual(a, b);
    assert.ok(a.length >= 32);
    assert.match(a, /^[A-Za-z0-9_-]+$/);
  });
});

describe('deepFreeze', () => {
  it('freezes nested objects immutably', () => {
    const frozen = deepFreeze({ a: { b: 1 } });
    assert.equal(Object.isFrozen(frozen), true);
    assert.equal(Object.isFrozen(frozen.a), true);
    assert.throws(() => { (frozen.a as { b: number }).b = 2; });
  });
});
