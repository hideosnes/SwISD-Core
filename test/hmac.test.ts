/**
 * 1. Relative path: test/hmac.test.ts
 * 2. Description: Unit tests for HMAC-SHA256 primitives (crypto/hmac.ts).
 * 3. Expects: node:test runner.
 * 4. Provides: Determinism, tamper-rejection, and RFC-vector verification.
 * 5. SPDX-License-Identifier: MPL-2.0
 * 6. Copyright (c) 2026 Homahuki GmbH
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateHmac, verifyHmac } from '../src/crypto/hmac.js';

const enc = (s: string) => new TextEncoder().encode(s);

describe('generateHmac', () => {
  it('matches the RFC 4231 test vector (key "key", data "The quick brown fox jumps over the lazy dog")', () => {
    const mac = generateHmac(enc('key'), enc('The quick brown fox jumps over the lazy dog'));
    const expected = 'f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8';
    assert.equal(Buffer.from(mac).toString('hex'), expected);
  });

  it('is deterministic for the same key and data', () => {
    const a = generateHmac(enc('k'), enc('d'));
    const b = generateHmac(enc('k'), enc('d'));
    assert.deepEqual([...a], [...b]);
  });

  it('changes when the key changes', () => {
    const a = generateHmac(enc('k1'), enc('d'));
    const b = generateHmac(enc('k2'), enc('d'));
    assert.notDeepEqual([...a], [...b]);
  });
});

describe('verifyHmac', () => {
  it('accepts a genuine MAC', () => {
    const key = enc('secret');
    const mac = generateHmac(key, enc('payload'));
    assert.equal(verifyHmac(key, enc('payload'), mac), true);
  });

  it('rejects a tampered payload', () => {
    const key = enc('secret');
    const mac = generateHmac(key, enc('payload'));
    assert.equal(verifyHmac(key, enc('payloae'), mac), false);
  });

  it('rejects a wrong key', () => {
    const mac = generateHmac(enc('k1'), enc('d'));
    assert.equal(verifyHmac(enc('k2'), enc('d'), mac), false);
  });

  it('rejects a truncated MAC without throwing', () => {
    const mac = generateHmac(enc('k'), enc('d'));
    assert.equal(verifyHmac(enc('k'), enc('d'), mac.slice(0, 16)), false);
  });
});
