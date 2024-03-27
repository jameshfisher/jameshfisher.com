---
title: How to self-host a TensorFlow.js model
tags:
  - programming
  - web
  - machine-learning
summary: >-
  Involves downloading the
  model manifest file and associated binary weight files, to avoid downloading
  large models every application launch.
---

The [various TensorFlow.js model libraries](https://github.com/tensorflow/tfjs-models)
will download the pretrained models from the web when your application launches.
Taking an example from an earlier post,
if you load the BodyPix library with the following config,
it will download 24 files from `storage.googleapis.com`,
totalling a hefty 91MB!

```js
const net = await bodyPix.load({
  architecture: 'ResNet50',
  outputStride: 16,
  quantBytes: 4
});
```

If you're developing an offline application,
you may want to store this model locally,
rather than downloading it every time your application starts.
Here's how to self-host a TensorFlow.js model.

The BodyPix library determines a model URL like the following:

```
https://storage.googleapis.com/tfjs-models/savedmodel/bodypix/resnet50/float/model-stride16.json
```

Notice the model URL depends on your config.
For example, if you change `outputStride: 16` to `outputStride: 32`,
it will download a different model.

TensorFlow.js model libraries like BodyPix will accept a `modelUrl` parameter,
which overrides the calculated URL.
For example, you can launch BodyPix like this:

```
const net = await bodyPix.load({
  architecture: 'ResNet50',
  outputStride: 16,
  quantBytes: 4,
  modelUrl: '/path/to/my/model-stride16.json'
});
```

Caution: if your model URL doesn't match your other `load()` config,
you'll get undefined behavior!
Decide on your desired config,
then check which file it downloads,
and grab that one.

But just downloading the JSON file is not enough.
TensorFlow.js will then try to download lots of other files, which will 404.
The file at `model-stride16.json` is just a "manifest",
describing the shape of the model,
and linking out to binary files that contain the weights for the model.

We need to download these binary files, too.
You could do this by trial and error,
or by looking at the manifest.
There's no spec or description of this "graph model" format,
but we can reverse-engineer it.
The manifest is a JSON file like this:

```
{
  format: 'graph-model',
  generatedBy: '1.15.0-dev20190802',
  convertedBy: 'TensorFlow.js Converter v1.2.6',
  modelTopology: {
    node: [Array],
    library: {},
    versions: { producer: 114 }
  },
  weightsManifest: [
    {
      paths: [
        'group1-shard1of23.bin',  'group1-shard2of23.bin',
        'group1-shard3of23.bin',  'group1-shard4of23.bin',
        'group1-shard5of23.bin',  'group1-shard6of23.bin',
        'group1-shard7of23.bin',  'group1-shard8of23.bin',
        'group1-shard9of23.bin',  'group1-shard10of23.bin',
        'group1-shard11of23.bin', 'group1-shard12of23.bin',
        'group1-shard13of23.bin', 'group1-shard14of23.bin',
        'group1-shard15of23.bin', 'group1-shard16of23.bin',
        'group1-shard17of23.bin', 'group1-shard18of23.bin',
        'group1-shard19of23.bin', 'group1-shard20of23.bin',
        'group1-shard21of23.bin', 'group1-shard22of23.bin',
        'group1-shard23of23.bin'
      ],
      weights: [Array]
    }
  ]
}
```

The relevant part for self-hosting is the `paths`.
We can get these with `model.weightsManifest.flatMap(w => w.paths)`.
The paths are URLs, relative to the manifest file.
For example, this is a URL to one of the `.bin` files:

```
https://storage.googleapis.com/tfjs-models/savedmodel/bodypix/resnet50/float/group1-shard1of23.bin
```

Here's a script that, given the URL to a manifest, will download the manifest and the weights:

```js
#!/usr/bin/env node

const fs = require('fs');
const util = require('util');
const stream = require('stream');
const path = require('path');
const fetch = require('node-fetch');

const pipeline = util.promisify(stream.pipeline);

async function download(url, filepath) {
  console.log(`Downloading ${url} to ${filepath}`);
  const res = await fetch(url);
  await pipeline(res.body, fs.createWriteStream(filepath));
  console.log(`Downloaded ${filepath}`);
}

async function downloadTensorFlowJsGraphModel(url, manifestFilepath) {
  await download(url, manifestFilepath);

  const model = JSON.parse(fs.readFileSync(manifestFilepath));

  await Promise.all(
    model.weightsManifest
      .flatMap(w => w.paths)
      .map(relativePath => download(
        new URL(relativePath, url),
        path.join(path.dirname(manifestFilepath), relativePath)
      )));
}

if (process.argv.length == 4) {
  downloadTensorFlowJsGraphModel(
    process.argv[2],
    process.argv[3]
  );
} else {
  console.log(`Usage: download-tfjs-model <manifestUrl> <manifestFilepath>`);
}
```

To download the model,
the BodyPix library [calls `loadGraphModel`](https://github.com/tensorflow/tfjs-models/blob/dba94801b28904f366d969589a278f451d223326/body-pix/src/body_pix_model.ts#L1016),
which is [implemented in the core TensorFlow.js library](https://github.com/tensorflow/tfjs/blob/de35d6fe41ffb4fef825a59a79d23543369d072d/tfjs-converter/src/executor/graph_model.ts#L377).
Reading this would be another, more reliable way to understand the format.
Something for another time, maybe.
