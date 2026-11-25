// 1. Relative path: src/observability/index.ts
// 2. Description: Barrel file for the observability module, enforcing single-step import depth.
// 3. Expects: Internal observability module files.
// 4. Provides: Centralized export of observability schema and the event bus.

export * from './schema.js';
export * from './eventBus.js';