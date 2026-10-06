// Prints the store indexes for the workflow matrix, e.g. [0,1,2].
// Only indexes are printed (never store ids), so secret masking cannot hide them.
const config = require('../config.json');
const { resolveStores } = require('./stores');

const count = Math.max(resolveStores(config).length, 1);
console.log(JSON.stringify(Array.from({ length: count }, (_, i) => i)));
