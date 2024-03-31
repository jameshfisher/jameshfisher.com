const fs = require('fs');
const { fetchNgram } = require('./ngram.js');

const terms = [];
for (let i = 1800; i <= 2000; i++) { terms.push(i.toString()); }

const MAX_BATCH_SIZE = 12;

const batches = [];

for (let i = 0; i < terms.length; i += MAX_BATCH_SIZE) {
  batches.push(terms.slice(i, i+MAX_BATCH_SIZE));
}

let db = {};

Promise.all(batches.map(fetchNgram)).then(arrs => {
  for (arr of arrs) {
    for (term of arr) {
      db[term['ngram']] = term['timeseries'];
    }
  }

  fs.writeFileSync('fiction.json', JSON.stringify(db));
}).catch(err => console.error(err));
