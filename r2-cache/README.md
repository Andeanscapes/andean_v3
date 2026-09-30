# CDN Media Cache

This directory contains gitignored copies of the media objects the published
feed references, served from `cdn.andeanscapes.com` (Cloudflare R2). Do not
commit the media itself.

    npm run media:pull                # CDN -> here
    npm run media:optimize            # convert + resize + crop in place
    npm run media:push                # optimize, then upload what differs
    npm run media:push -- --dry-run   # print the plan, upload nothing
    npm run media:push -- --upscale   # allow undersized sources to fill slots
    npm run media:sync                # upscale, optimize, upload, prune originals, purge cache
    npm run media:sync:new            # same, for keys the feed does not reference yet

Drop a source of **any size or shape** (`.jpg`, `.png`, `.heic`, `.mov`, `.mp4`)
at the key you want it published under. The filename decides the output size, so
the same photo can be dropped twice and each copy is produced for its own slot:

    cp photo.jpg r2-cache/images/brand/landing-hero.jpg          # -> 1600x751
    cp photo.jpg r2-cache/images/brand/landing-hero-mobile.jpg   # ->  800x375
    npm run media:push

`media:optimize` — which `media:push` runs first — converts images to `.webp`
and video to `.webm`, then resizes and crops each to fill its slot exactly. Only
`.webp`, `.avif`, `.webm` and `.svg` are uploaded.

Originals are **kept** by `media:push`. They are never uploaded — only delivery
formats are — so they simply sit here. The default is to keep them because the
upload cannot be undone: with the original gone, a bad crop is unrecoverable.

`--prune-sources` removes originals after their converted outputs upload
successfully. `media:sync` enables it, so the original is gone once its `.webp`
is published: upload success does not prove that an automatic crop is visually
correct, and R2 object versioning is not enabled. Use `media:push` to keep
originals. An output whose original is still on disk is re-uploaded even when
R2 already holds it, so every removal follows a confirmed upload. Anything that
failed to upload keeps its source, as does any pair of originals that would
produce the same delivery key. `--dry-run` lists what would be removed without
touching it.

Two different flags, deliberately: `--prune-sources` deletes after a confirmed
publish, while the optimizer's `--consume-sources` deletes at conversion time,
before the upload it feeds.

Cropping keeps the centre of the frame, which holds the subject far more
reliably than the highest-contrast region does — sharp's `attention` strategy
picked the sky over five faces on a real hero photo. Use `--crop=top`, `bottom`,
`left`, `right`, `entropy` or `attention` when the subject sits elsewhere; the
run reports how much area each crop discards.

Each slot has a byte budget, and quality steps down from 80 until the output
fits. A file that still will not fit at the floor is reported rather than
degraded further — the fix is usually a less noisy source.

A source smaller than its slot is refused by default rather than upscaled. Pass
`--upscale` when necessary; it fills the slot but may produce a softer image.

`.heic` / `.heif` are decoded with `ffmpeg` first: sharp's libvips ships HEIF for
AVIF only, since the HEVC decoder HEIC needs is patent-encumbered. Install ffmpeg
(`brew install ffmpeg`) or export as JPEG. A file that cannot be decoded is
reported and skipped — one bad source never aborts the run.

Only keys something actually reads may be published: what the feed references,
what `SiteConfig` declares (the footer tiles), and the `-mobile` sibling of each
image. A mistyped filename is rejected with the intended key suggested, because
cropping now succeeds for any shape and would otherwise publish a perfectly
valid object that nothing reads. Pass `--allow-orphan` — or use
`npm run media:sync:new` — when staging media ahead of the feed change that will
reference it. It is deliberately **not** part of `media:sync`: that guard is the
only thing standing between a typo and a published object nothing ever reads.

## Adding a landing hero

The hero pool is derived from filenames, so adding one is dropping files in:

    cp photo.jpg        r2-cache/images/brand/landing-hero-04.jpg
    cp photo-small.jpg  r2-cache/images/brand/landing-hero-04-mobile.jpg
    npm run media:sync                # uploads; prints the steps below
    npm run fixtures:fetch
    npm run feed:stage-hero-variants
    npm run feed:publish -- --confirm # review the diff first

`media:sync` accepts the hero convention without `--allow-orphan`, so a new
`landing-hero-<n>.webp` uploads like any other file — but **uploading is not
publishing**. The site renders what the feed lists, so the image stays inert in
R2 until the pool is republished. `media:sync` prints the remaining commands for
exactly that reason.

Publishing is a separate command on purpose: it overwrites live business data
and the bucket has no object versioning, so it must not happen as a side effect
of syncing media.

`feed:stage-hero-variants` scans for `landing-hero.webp` and
`landing-hero-<n>.webp`, unions them with what the feed already publishes, and
refuses to stage anything whose object — or `-mobile` sibling — is not live on
the CDN. Nothing is hand-edited, and it scales to any number of images.

`media:pull` derives its object list from `fixtures/` and
`feed-migration/next/`, so run `npm run fixtures:fetch` first if the local feed
copies are stale. It will not overwrite an output whose source is sitting in the
cache un-pushed.

`media:push` writes real published media and **uploads without asking**. It
prints the plan first and refuses unreferenced keys, but the overwrite itself has
no undo: the bucket has no object versioning, so the previous bytes are gone.
`npm run media:pull` before editing is the only backup. Use `--dry-run` when
unsure.

## Caching

The CDN keys HEAD and GET separately, so an object can be current in R2 while
browsers keep receiving the previous bytes for the rest of its TTL (4 hours at
the time of writing). Every comparison here therefore goes to origin with a
cache-busting parameter, and downloads do too, so a stale edge copy can never be
written into this directory.

Files are compared by **content**, not size: R2's ETag is the MD5 of the object,
and it is checked against the MD5 of the local file. A replaced image that
happens to encode to the same byte count is therefore still uploaded. (Size is
only the fallback for an ETag that is not a content hash.)

After uploading, `media:push` checks what the CDN actually serves. If visitors
already get the new bytes — the usual case, since media objects are not
edge-cached today — it says so and skips the purge. Only URLs still stale at the
edge are purged, which needs `Zone · Cache Purge · Purge` on
`CLOUDFLARE_API_TOKEN`; without it the upload still succeeds and the URLs to
purge by hand are printed instead. Any object current in R2 but stale at the edge
is reported on every run — including runs with nothing to upload.

Set `CLOUDFLARE_ZONE_ID` to skip the zone lookup if the token cannot list zones.

Flags: `--allow-orphan` and `--prune-sources` apply to the upload; `--dry-run`
applies to both (the optimizer then writes nothing either); `--force`, `--crop=`,
`--offline` and `--consume-sources` are forwarded to the optimizer. `--confirm` and `--keep-sources` are accepted and ignored — they used
to be required and are now the defaults.
