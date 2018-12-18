
const fs = require('fs');
const json = fs.readFileSync('db2.json');
const db = JSON.parse(json);

const DB_START_YEAR = 1800;

const START_YEAR = 1800;
const END_YEAR = 2000;

function valAt(referencingYear, referencedYear) {
  // if (referencingYear > referencedYear) return undefined;
  // if (referencedYear % 10 == 0) return undefined;
  return db[referencedYear][referencingYear-DB_START_YEAR] * 1000000000;
}

const tinygradient = require('tinygradient');
var gradient = tinygradient('black', '#4e036e', '#ff9b00', '#f8fd91');

const hdr = require("hdr-histogram-js");
const histogram = hdr.build({ 
  bitBucketSize: 64
});

for (let referencingYear = START_YEAR; referencingYear <= END_YEAR; referencingYear++) {
  for (let referencedYear = START_YEAR; referencedYear <= END_YEAR; referencedYear++) {
    const val = valAt(referencingYear, referencedYear);
    if (val !== undefined) histogram.recordValue(val);
  }
}

function getPercentileForValue(h, x) {
  let min = 0;
  let max = 100;
  while (max-min > 0.2) {
    let mid = (min+max)/2;
    let v = h.getValueAtPercentile(mid);
    if (v < x) {
      min = mid;
    } else if (x < v) {
      max = mid;
    } else {
      return v;
    }
  }
  return min;
}

function toColor(x) {
  let p = getPercentileForValue(histogram, x)/100;
  let color = gradient.rgbAt(p);
  return color.toRgb();
}

const PNGImage = require('pngjs-image');

const CHART_START = 45;

PNGImage.readImage('back.png', function (err, image) {
  if (err) throw err;

  for (let referencingYear = START_YEAR; referencingYear <= END_YEAR; referencingYear++) {
    for (let referencedYear = START_YEAR; referencedYear <= END_YEAR; referencedYear++) {
      const val = valAt(referencingYear, referencedYear);
      const color = val === undefined ? {r:0, b: 0, g:0} : toColor(val);
      image.setAt(referencingYear-START_YEAR+CHART_START, referencedYear-START_YEAR+CHART_START, { red:color.r, green:color.g, blue:color.b, alpha:255 });
    }
  }

  const img2 = PNGImage.copyImage(image);
  img2.writeImage('all_english.png', function (err) {
    if (err) throw err;
  });
});
