const assert = require('assert');
const { resolveStores } = require('../src/stores');

// legacy single store keeps working, no label, no cache suffix
let s = resolveStores({ store: {} }, { SWIGGY_STORE_ID: '1', SWIGGY_PRIMARY_STORE_ID: '2', SWIGGY_SECONDARY_STORE_ID: '3' });
assert.deepStrictEqual(s, [{ sid: '1', pid: '2', secid: '3', label: '', cacheSuffix: '' }]);

// the base store is passed through exactly as configured (empty stays empty)
s = resolveStores({}, { SWIGGY_STORE_ID: '1' });
assert.strictEqual(s[0].pid, '');
assert.strictEqual(s[0].secid, '');

// env list adds stores, dedupes the base store, labels everything
s = resolveStores({}, { SWIGGY_STORE_ID: '1', SWIGGY_STORE_IDS: '1, 7:8 ,9' });
assert.deepStrictEqual(s.map((x) => x.sid), ['1', '7', '9']);
assert.strictEqual(s[1].secid, '8');
assert.strictEqual(s[2].pid, '9');
assert.strictEqual(s[2].secid, '9');
assert.strictEqual(s[1].cacheSuffix, '_store7');
assert.strictEqual(s[0].cacheSuffix, '');
assert(s.every((x) => x.label));

// config.json stores with names
s = resolveStores({ stores: [{ id: '5', name: 'Office' }] }, { SWIGGY_STORE_ID: '1' });
assert.strictEqual(s[1].label, 'Office');

// no base id but a list: still works
s = resolveStores({}, { SWIGGY_STORE_IDS: '4' });
assert.strictEqual(s.length, 1);
assert.strictEqual(s[0].sid, '4');
assert.strictEqual(s[0].cacheSuffix, '_store4');

// nothing configured
assert.deepStrictEqual(resolveStores({}, {}), []);
// storeNames labels by position, base store included, only with 2+ stores
s = resolveStores({ storeNames: ['Home', 'Gold Gym'] }, { SWIGGY_STORE_ID: '1', SWIGGY_STORE_IDS: '2' });
assert.deepStrictEqual(s.map((x) => x.label), ['Home', 'Gold Gym']);
assert.deepStrictEqual(s.map((x) => x.cacheSuffix), ['', '_store2']);
s = resolveStores({ storeNames: ['Home', 'Gold Gym'] }, { SWIGGY_STORE_ID: '1' });
assert.strictEqual(s[0].label, '');
// storeNames wins over config stores name; missing names fall back
s = resolveStores({ storeNames: ['Home'], stores: [{ id: '5', name: 'Office' }] }, { SWIGGY_STORE_ID: '1' });
assert.deepStrictEqual(s.map((x) => x.label), ['Home', 'Office']);
console.log('stores tests passed');
