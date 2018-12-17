---
title: "What is the  API for Google Ngram Viewer?"
tags: ["programming"]
---

The [Google Ngram Viewer](https://books.google.com/ngrams) shows the frequency of phrases over time.
Unfortunately, it doesn't have a documented API, only an old-school static website.
But fortunately, the HTML is clean enough to scrape,
giving us a fairly clean function to fetch the ngram data for a set of phrases:

```js
const fetch = require('node-fetch');

const regexp = /var data = (.*);/;

async function fetchNgram(phrases) {
  console.log("ngram(", phrases, ")");
  const params = new URLSearchParams();
  params.set('content', phrases.join(','));
  params.set('year_start', '1800');
  params.set('year_end', '2000');
  params.set('corpus', '15');  // English
  params.set('smoothing', '0');
  const response = await fetch('https://books.google.com/ngrams/graph?' + params.toString());
  const responseText = await response.text();
  const match = regexp.exec(responseText);
  const json = match[1];
  return JSON.parse(json); 
}

module.exports = { fetchNgram };
```

Here's an example of usage,
showing the frequency of "Churchill" between 1800 and 2000:

```console
$ node
> const ngram = require('./ngram.js');
undefined
> ngram.fetchNgram(['churchill']).then(results => console.log(results))
...
[ { ngram: 'churchill',
    type: 'NGRAM',
    timeseries:
     [ 0,
       0,
       0,
       0,
       0,
       8.670756557194181e-9,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       4.8912465189232535e-9,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       6.636060145837064e-9,
       0,
       0,
       0,
       0,
       0,
       0,
       2.5820690030542437e-9,
       0,
       0,
       0,
       2.1887325285518955e-9,
       1.3056348002749019e-8,
       0,
       2.7888971132483675e-8,
       0,
       2.1819193563032968e-8,
       2.4176788571139696e-8,
       7.1592420880506324e-9,
       8.637795900767742e-8,
       1.024051528020209e-7,
       1.601298009745733e-7,
       1.425537590193926e-7,
       1.7062754409380432e-7,
       2.3069164001299214e-7,
       1.2067783927705023e-7,
       1.1514062947526327e-7,
       6.476815173073192e-8,
       1.6379419776058057e-7,
       5.2594170796282924e-8,
       4.055480395948052e-9,
       0,
       0,
       1.9281829466422096e-9,
       4.017602961425837e-8,
       4.119712571082346e-8,
       4.372613560121863e-8,
       1.213549865042296e-7,
       8.8242543938577e-8,
       0,
       1.570678587192731e-9,
       1.553099537865421e-9,
       0,
       1.4976280215961424e-9,
       0,
       1.5280039455944916e-9,
       1.2751474320893408e-9,
       1.2670179350138255e-9,
       1.2069970578565403e-9,
       3.22512350159343e-9,
       0,
       1.9832787856444156e-8,
       2.748298033594665e-9,
       0,
       0,
       0,
       0,
       3.5304474899078286e-9,
       0,
       4.368577055657852e-9,
       4.446344181729955e-9,
       0,
       1.903092350374891e-9,
       0,
       5.409022563185317e-9,
       0,
       ... 101 more items ],
    parent: '' } ]
```
