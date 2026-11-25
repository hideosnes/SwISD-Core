/**
 * 1. Relative path: test/hex.test.ts
 * 2. Description: Unit tests for hex serialization (crypto/hex.ts).
 * 3. Expects: node:test runner.
 * 4. Provides: Round-trip, purity, and rejection guarantees for hex encoding.
 * 5. SPDX-License-Identifier: MPL-2.0
 * 6. Copyright (c) 2026 Homahuki GmbH
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { bytesToHex, hexToBytes, isHexString } from '../src/crypto/hex.js';

describe('bytesToHex', () => {
  it('encodes with 0x prefix, lowercase, zero-padded', () => {
    assert.equal(bytesToHex(new Uint8Array([0x00, 0x0f, 0xff, 0xab])), '0x000fffab');
  });

  it('encodes empty input as 0x', () => {
    assert.equal(bytesToHex(new Uint8Array()), '0x');
  });
});

describe('hexToBytes', () => {
  it('round-trips back to the original bytes', () => {
    const original = new Uint8Array([0x00, 0x01, 0x7f, 0x80, 0xff]);
    assert.deepEqual([...hexToBytes(bytesToHex(original))], [...original]);
  });

  it('rejects strings without the 0x prefix', () => {
    assert.throws(() => hexToBytes('deadbeef' as never), /must start with 0x/);
  });

  it('rejects odd-length hex', () => {
    assert.throws(() => hexToBytes('0xabc' as never), /must be even/);
  });
});

describe('isHexString', () => {
  it('accepts valid lowercase hex', () => {
    assert.equal(isHexString('0xdeadbeef'), true);
  });

  it('rejects uppercase hex', () => {
    assert.equal(isHexString('0xDEADBEEF'), false);
  });

  it('rejects empty and non-hex payloads', () => {
    assert.equal(isHexString('0x'), false);
    assert.equal(isHexString('0xghijkl'), false);
    assert.equal(isHexString('deadbeef'), false);
  });
});
