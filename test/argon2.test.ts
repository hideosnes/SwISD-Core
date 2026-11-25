/**
 * 1. Relative path: test/argon2.test.ts
 * 2. Description: Unit tests for Argon2id hashing (crypto/argon2.ts).
 * 3. Expects: node:test runner. Uses reduced memory/time params for CI speed.
 * 4. Provides: PHC format, verification, and rejection guarantees.
 * 5. SPDX-License-Identifier: MPL-2.0
 * 6. Copyright (c) 2026 Homahuki GmbH
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hashArgon2id, verifyArgon2id, type Argon2idParams } from '../src/crypto/argon2.js';

const enc = (s: string) => new TextEncoder().encode(s);

// Fast params for tests — same format, no 64MB memory burn.
const fastParams: Argon2idParams = {
  time: 1,
  memory: 1024,
  parallelism: 1,
  saltLength: 16,
  hashLength: 32,
};

describe('hashArgon2id', () => {
  it('emits a PHC-format $argon2id$ string with the requested params', () => {
    const encoded = hashArgon2id(enc('hunter2'), fastParams);
    assert.match(encoded, /^\$argon2id\$v=19\$m=1024,t=1,p=1\$0x[0-9a-f]+\$0x[0-9a-f]+$/);
  });

  it('embeds a fresh salt on every call', () => {
    const a = hashArgon2id(enc('same'), fastParams);
    const b = hashArgon2id(enc('same'), fastParams);
    assert.notEqual(a, b);
  });
});

describe('verifyArgon2id', () => {
  it('accepts the correct password', () => {
    const encoded = hashArgon2id(enc('correct horse'), fastParams);
    assert.equal(verifyArgon2id(enc('correct horse'), encoded), true);
  });

  it('rejects a wrong password', () => {
    const encoded = hashArgon2id(enc('correct horse'), fastParams);
    assert.equal(verifyArgon2id(enc('battery staple'), encoded), false);
  });

  it('rejects malformed encoded strings without throwing', () => {
    assert.equal(verifyArgon2id(enc('x'), 'not-a-hash'), false);
    assert.equal(verifyArgon2id(enc('x'), '$argon2id$v=19$garbage'), false);
    assert.equal(verifyArgon2id(enc('x'), '$bcrypt$v=19$m=1,t=1,p=1$0xab$0xcd'), false);
  });
});
