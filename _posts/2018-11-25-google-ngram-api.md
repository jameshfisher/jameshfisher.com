---
title: "What is the  API for Google Ngram Viewer?"
tags: ["programming"]
---

The [Google Ngram Viewer](https://books.google.com/ngrams) shows the frequency of phrases over time.
It has an API, but it's not documented.
In the [Google Ngram Viewer](https://books.google.com/ngrams) site,
if you search for the frequency of "Churchill" between 1800 and 2000,
it will take you to a page at this URL:

```
https://books.google.com/ngrams/graph?content=Churchill&year_start=1800&year_end=2000&corpus=26&smoothing=3
```

This URL gives you an HTML page showing a chart.
To turn this into an API, 
just replace the `graph` in the URL with `json`.
For example, here's the same query from the CLI, 
showing the results as JSON:

```console
$ curl -s 'https://books.google.com/ngrams/json?content=Churchill&year_start=1800&year_end=2000&corpus=26&smoothing=3' | jq . | head
[
  {
    "ngram": "Churchill",
    "parent": "",
    "type": "NGRAM",
    "timeseries": [
      3.4028656727969064e-06,
      3.4380268971290205e-06,
      3.466722167407473e-06,
      3.4695450982066437e-06,
```

Thanks to Frans Badenhorst for this solution!
What follows is my original solution, which is less elegant.

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
       ...
       0,
       5.409022563185317e-9,
       0,
       ... 101 more items ],
    parent: '' } ]
```
