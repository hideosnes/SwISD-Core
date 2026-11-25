/**
 * 1. Relative path: test/ed25519.test.ts
 * 2. Description: Unit tests for Ed25519 identity primitives (crypto/ed25519.ts).
 * 3. Expects: node:test runner.
 * 4. Provides: Key generation, sign/verify round-trip, and forgery rejection.
 * 5. SPDX-License-Identifier: MPL-2.0
 * 6. Copyright (c) 2026 Homahuki GmbH
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateEd25519KeyPair, signEd25519, verifyEd25519 } from '../src/crypto/ed25519.js';

const enc = (s: string) => new TextEncoder().encode(s);

describe('generateEd25519KeyPair', () => {
  it('returns DER-encoded keys of non-zero length', () => {
    const { publicKey, privateKey } = generateEd25519KeyPair();
    assert.ok(publicKey.length > 0);
    assert.ok(privateKey.length > 0);
  });

  it('generates distinct key pairs on each call', () => {
    const a = generateEd25519KeyPair();
    const b = generateEd25519KeyPair();
    assert.notDeepEqual([...a.privateKey], [...b.privateKey]);
  });
});

describe('sign/verify round-trip', () => {
  it('verifies a genuine signature', () => {
    const { publicKey, privateKey } = generateEd25519KeyPair();
    const data = enc('control-plane message');
    const sig = signEd25519(privateKey, data);
    assert.equal(verifyEd25519(publicKey, data, sig), true);
  });

  it('rejects a signature over different data', () => {
    const { publicKey, privateKey } = generateEd25519KeyPair();
    const sig = signEd25519(privateKey, enc('original'));
    assert.equal(verifyEd25519(publicKey, enc('tampered'), sig), false);
  });

  it('rejects a signature from a different key', () => {
    const a = generateEd25519KeyPair();
    const b = generateEd25519KeyPair();
    const sig = signEd25519(a.privateKey, enc('d'));
    assert.equal(verifyEd25519(b.publicKey, enc('d'), sig), false);
  });

  it('rejects a truncated signature', () => {
    const { publicKey, privateKey } = generateEd25519KeyPair();
    const data = enc('d');
    const sig = signEd25519(privateKey, data);
    assert.equal(verifyEd25519(publicKey, data, sig.slice(0, 30)), false);
  });
});
