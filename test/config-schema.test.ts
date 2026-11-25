/**
 * 1. Relative path: test/config-schema.test.ts
 * 2. Description: Unit tests for provision config type guards (config/schema.ts).
 * 3. Expects: node:test runner.
 * 4. Provides: Accept/reject guarantees for the USB-stick provision schema.
 * 5. SPDX-License-Identifier: MPL-2.0
 * 6. Copyright (c) 2026 Homahuki GmbH
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isProvisionConfig,
  isWifiConfig,
  isTailscaleConfig,
  isHuggingFaceModelSource,
} from '../src/config/schema.js';

const validConfig = {
  wifi: { ssid: 'home', psk: 'secret', country: 'AT' },
  role: 'worker',
  modelSource: { type: 'hf', url: 'https://huggingface.co/org/model' },
  version: 1,
};

describe('isProvisionConfig', () => {
  it('accepts a valid provision config', () => {
    assert.equal(isProvisionConfig(validConfig), true);
  });

  it('accepts a config with an optional tailscale block', () => {
    assert.equal(isProvisionConfig({ ...validConfig, tailscale: { authKey: 'tskey-auth-x' } }), true);
  });

  it('rejects a non-object', () => {
    assert.equal(isProvisionConfig(null), false);
    assert.equal(isProvisionConfig('string'), false);
    assert.equal(isProvisionConfig(42), false);
  });

  it('rejects a missing or invalid wifi block', () => {
    assert.equal(isProvisionConfig({ ...validConfig, wifi: undefined }), false);
    assert.equal(isProvisionConfig({ ...validConfig, wifi: { ssid: 'x' } }), false);
  });

  it('rejects an invalid role', () => {
    assert.equal(isProvisionConfig({ ...validConfig, role: 'emperor' }), false);
  });

  it('rejects an invalid modelSource', () => {
    assert.equal(isProvisionConfig({ ...validConfig, modelSource: { type: 'wrong' } }), false);
  });

  it('rejects a missing or non-integer version', () => {
    assert.equal(isProvisionConfig({ ...validConfig, version: undefined }), false);
    assert.equal(isProvisionConfig({ ...validConfig, version: 1.5 }), false);
    assert.equal(isProvisionConfig({ ...validConfig, version: 0 }), false);
  });

  it('rejects a malformed tailscale block', () => {
    assert.equal(isProvisionConfig({ ...validConfig, tailscale: { authKey: 42 } }), false);
    assert.equal(isProvisionConfig({ ...validConfig, tailscale: 'tskey' }), false);
  });
});

describe('isTailscaleConfig', () => {
  it('treats undefined as valid (block is optional)', () => {
    assert.equal(isTailscaleConfig(undefined), true);
  });

  it('accepts an auth key with an optional hostname', () => {
    assert.equal(isTailscaleConfig({ authKey: 'tskey-auth-x' }), true);
    assert.equal(isTailscaleConfig({ authKey: 'tskey-auth-x', hostname: 'swisd-pi-1' }), true);
  });

  it('rejects a missing key or non-string hostname', () => {
    assert.equal(isTailscaleConfig({}), false);
    assert.equal(isTailscaleConfig({ authKey: 'k', hostname: 42 }), false);
    assert.equal(isTailscaleConfig(null), false);
  });
});

describe('isWifiConfig', () => {
  it('accepts ssid, psk, and country', () => {
    assert.equal(isWifiConfig({ ssid: 'a', psk: 'b', country: 'AT' }), true);
  });

  it('rejects missing fields', () => {
    assert.equal(isWifiConfig({ ssid: 'a' }), false);
    assert.equal(isWifiConfig({ ssid: 'a', psk: 'b' }), false);
  });
});

describe('isHuggingFaceModelSource', () => {
  it('accepts an hf source with a url', () => {
    assert.equal(isHuggingFaceModelSource({ type: 'hf', url: 'https://x' }), true);
  });

  it('rejects wrong type or missing url', () => {
    assert.equal(isHuggingFaceModelSource({ type: 'local', url: 'https://x' }), false);
    assert.equal(isHuggingFaceModelSource({ type: 'hf' }), false);
  });
});
