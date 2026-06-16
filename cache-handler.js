// cache-handler.js
// Subclasses Next.js default FileSystemCache and adds a hard size cap with
// LRU (oldest-mtime-first) eviction over the on-disk ISR cache (.next/server/app).
// Purpose: stop the ISR prerender cache (.rsc/.html/.meta) from filling the disk.
// All get/set/serialization behaviour is inherited unchanged from FileSystemCache;
// we only override set() to occasionally run eviction.
const path = require("path");
const fs = require("fs");

const mod = require("next/dist/server/lib/incremental-cache/file-system-cache");
const FileSystemCache = mod.default || mod.FileSystemCache || mod;

const MAX_BYTES =
  parseInt(process.env.ISR_CACHE_MAX_BYTES || "", 10) || 2 * 1024 * 1024 * 1024; // 2 GB default
const CHECK_EVERY = parseInt(process.env.ISR_CACHE_CHECK_EVERY || "", 10) || 200;
const EXTS = new Set([".html", ".rsc", ".meta", ".body", ".json"]);

let counter = 0;
let evicting = false;

function listCacheFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch (e) {
      continue;
    }
    for (const ent of entries) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) {
        stack.push(p);
        continue;
      }
      if (!EXTS.has(path.extname(ent.name))) continue;
      try {
        const st = fs.statSync(p);
        out.push({ p, size: st.size, mtime: st.mtimeMs });
      } catch (e) {}
    }
  }
  return out;
}

function evict(appDir) {
  if (evicting || !appDir) return;
  evicting = true;
  try {
    const files = listCacheFiles(appDir);
    let total = 0;
    for (const f of files) total += f.size;
    if (total <= MAX_BYTES) return;
    files.sort((a, b) => a.mtime - b.mtime); // oldest first
    const target = total - Math.floor(MAX_BYTES * 0.85); // trim to ~85% of cap
    let freed = 0;
    for (const f of files) {
      if (freed >= target) break;
      try {
        fs.unlinkSync(f.p);
        freed += f.size;
      } catch (e) {}
    }
  } catch (e) {
  } finally {
    evicting = false;
  }
}

class CappedFileSystemCache extends FileSystemCache {
  async set(...args) {
    const r = await super.set(...args);
    if (++counter >= CHECK_EVERY) {
      counter = 0;
      const appDir = this.serverDistDir
        ? path.join(this.serverDistDir, "app")
        : null;
      setImmediate(() => evict(appDir));
    }
    return r;
  }
}

module.exports = CappedFileSystemCache;
module.exports.default = CappedFileSystemCache;
