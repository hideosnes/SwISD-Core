/**
 * 1. Relative path: test/errors.test.ts
 * 2. Description: Unit tests for the SwISD error taxonomy (errors.ts).
 * 3. Expects: node:test runner.
 * 4. Provides: Code identity, cause-chaining, and instanceof guarantees.
 * 5. SPDX-License-Identifier: MPL-2.0
 * 6. Copyright (c) 2026 Homahuki GmbH
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SwISDError, DeliveryFilesystemError } from '../src/errors.js';

describe('SwISDError', () => {
  it('carries its code and message', () => {
    const err = new SwISDError('ERR_INVALID_STATE', 'something broke');
    assert.equal(err.code, 'ERR_INVALID_STATE');
    assert.equal(err.message, 'something broke');
    assert.equal(err instanceof Error, true);
    assert.equal(err instanceof SwISDError, true);
  });

  it('chains an underlying cause', () => {
    const cause = new Error('root cause');
    const err = new SwISDError('ERR_DELIVERY_INVALID_ARTIFACT', 'wrapped', cause);
    assert.equal(err.cause, cause);
  });

  it('requires an explicit message and carries it', () => {
    const err = new SwISDError('ERR_UNAUTHORIZED', 'no ticket');
    assert.equal(err.message, 'no ticket');
  });
});

describe('DeliveryFilesystemError', () => {
  it('is a SwISDError', () => {
    const err = new DeliveryFilesystemError('cannot write', new Error('EACCES'));
    assert.equal(err instanceof SwISDError, true);
    assert.equal(err instanceof DeliveryFilesystemError, true);
  });
});
