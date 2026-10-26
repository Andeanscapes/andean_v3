// Worker entry: wraps the OpenNext handler with the edge HTML cache.
// Type-checked by `typecheck:worker` after OpenNext generates `.open-next/`.
import openNextWorker from './.open-next/worker.js';
import buildId from './.open-next/server-functions/default/.next/BUILD_ID';
import { withEdgeCache, type EdgeCache } from './src/lib/edge-cache';

// Re-exported so Durable Object bindings keep resolving if the OpenNext R2
// incremental cache, queue or tag cache is configured later.
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from './.open-next/worker.js';

/** Workers runtime global: `caches.default` is the zone's edge cache. */
declare const caches: { default: EdgeCache };

export default {
  fetch: withEdgeCache(openNextWorker.fetch, () => caches.default, buildId.trim()),
};
