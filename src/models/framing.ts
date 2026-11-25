/**
 * 1. Relative path: src/models/framing.ts
 * 2. Description: Storage convention for model chunks — the naming scheme shared by ingest, manager, and downloader.
 * 3. Expects: Nothing beyond the Node filesystem path module.
 * 4. Provides: The chunk path convention (one writer, one truth).
 * 5. SPDX-License-Identifier: MPL-2.0
 * 6. Copyright (c) 2026 Homahuki GmbH
 */

import { join } from 'node:path';

export function chunkFileName(chunkIndex: number): string {
  return `chunk_${chunkIndex.toString().padStart(4, '0')}.bin`;
}

export function chunkPath(deliveryRoot: string, modelId: string, chunkIndex: number): string {
  return join(deliveryRoot, 'models', modelId, chunkFileName(chunkIndex));
}
