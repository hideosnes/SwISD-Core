/**
 * 1. Relative path: test/framing.test.ts
 * 2. Description: Unit tests for the model chunk storage convention (models/framing.ts).
 * 3. Expects: node:test runner.
 * 4. Provides: Naming and path-layout guarantees shared by ingest, manager, and downloader.
 * 5. SPDX-License-Identifier: MPL-2.0
 * 6. Copyright (c) 2026 Homahuki GmbH
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { chunkFileName, chunkPath } from '../src/models/framing.js';

describe('chunkFileName', () => {
  it('zero-pads the index to four digits', () => {
    assert.equal(chunkFileName(0), 'chunk_0000.bin');
    assert.equal(chunkFileName(7), 'chunk_0007.bin');
    assert.equal(chunkFileName(1234), 'chunk_1234.bin');
  });

  it('keeps the .bin extension', () => {
    assert.match(chunkFileName(42), /\.bin$/);
  });
});

describe('chunkPath', () => {
  it('lays out chunks under <root>/models/<modelId>/', () => {
    const path = chunkPath('/opt/swisd', 'org/model', 5);
    assert.ok(path.startsWith('/opt/swisd/models/org/model/'));
    assert.ok(path.endsWith('chunk_0005.bin'));
  });

  it('is deterministic for the same inputs', () => {
    assert.equal(chunkPath('/a', 'm', 1), chunkPath('/a', 'm', 1));
  });
});
