/**
 * Multi-store support.
 *
 * The first store is the one configured the old way (SWIGGY_STORE_ID,
 * SWIGGY_PRIMARY_STORE_ID, SWIGGY_SECONDARY_STORE_ID or config.store), so
 * existing setups keep working and keep their dedup caches.
 *
 * Labels: config.json "storeNames": ["Home", "Gold Gym"] names stores by position
 * (first = base store). Labels only show in alerts when 2+ stores are configured.
 *
 * Extra stores come from either:
 *   - env SWIGGY_STORE_IDS: comma separated, each entry "id" or "id:secondaryId"
 *     (example: "1400216,1401290:1231805")
 *   - config.json "stores": [{ "id": "1400216", "name": "Office", "secondaryId": "1231805" }]
 * For extra stores the primary id and secondary id default to the store id.
 * The first store is passed through exactly as configured.
 */

function parseEnvStores(raw) {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const [id, secondaryId] = entry.split(':').map((p) => p.trim());
      return { id, secondaryId };
    });
}

function resolveStores(config = {}, env = process.env) {
  const baseSid = env.SWIGGY_STORE_ID || config.store?.sid || '';
  const basePid = env.SWIGGY_PRIMARY_STORE_ID || config.store?.pid || '';
  const baseSecid = env.SWIGGY_SECONDARY_STORE_ID || config.store?.secid || '';

  const stores = [];
  const seen = new Set();

  if (baseSid) {
    stores.push({ sid: baseSid, pid: basePid, secid: baseSecid, label: '', cacheSuffix: '' });
    seen.add(String(baseSid));
  }

  const extras = [
    ...(Array.isArray(config.stores) ? config.stores : []),
    ...parseEnvStores(env.SWIGGY_STORE_IDS)
  ];

  for (const extra of extras) {
    const id = String(extra.id || '').trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    stores.push({
      sid: id,
      pid: String(extra.primaryId || id),
      secid: String(extra.secondaryId || id),
      label: extra.name || '',
      cacheSuffix: `_store${id}`
    });
  }

  // With several stores every store gets a label so alerts name the store.
  // config.storeNames labels stores by position (0 = base store), which keeps the
  // (secret) ids out of the repo: "storeNames": ["Home", "Gold Gym"].
  if (stores.length > 1) {
    const names = Array.isArray(config.storeNames) ? config.storeNames : [];
    stores.forEach((s, i) => {
      s.label = names[i] || s.label || `Store ${s.sid}`;
    });
  }

  return stores;
}

module.exports = { resolveStores, parseEnvStores };
