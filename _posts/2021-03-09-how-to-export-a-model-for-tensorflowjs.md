---
title: "How to export a model for TensorFlow.js"
tags: ["tensorflow", "programming", "ml"]
---

This post shows how to save a "hello world" model in TensorFlow (Python),
export it for TensorFlow.js, then run it in the browser.
The model multiplies its input by 5,
and you can see this exciting behavior here:

<div>
  <input type="number" id="modelInput" />
  <span id="modelOutput"></span>
</div>

Here's some Python that saves a model in the SavedModel format.
The model just multiplies its input by 5.

```python
import tensorflow as tf

class HelloModule(tf.Module):
  def __init__(self):
    super(HelloModule, self).__init__()
  @tf.function(input_signature=[tf.TensorSpec(shape=[None], dtype=tf.float32)])
  def __call__(self, inputs):
    return inputs * 5.

module = HelloModule()

tf.saved_model.save(module, './hello_model/saved_model')
```

After running this, you can see various saved files:

```shell
$ find hello_model
hello_model
hello_model/saved_model
hello_model/saved_model/variables
hello_model/saved_model/variables/variables.data-00000-of-00001
hello_model/saved_model/variables/variables.index
hello_model/saved_model/saved_model.pb
hello_model/saved_model/assets
```

You then use `tensorflowjs_converter` to convert the SavedModel format
to the (undocumented) TensorFlow.js "Graph Model" format:

```shell
$ pip3 install tensorflowjs
...
$ tensorflowjs_converter \
  --input_format=tf_saved_model \
  --output_format=tfjs_graph_model \
  hello_model/saved_model hello_model/web_model
...

Writing weight file hello_model/web_model/model.json...
```

This has created a `model.json` which refers to some binary files containing the weights:

```shell
$ find hello_model/web_model
hello_model/web_model
hello_model/web_model/model.json
hello_model/web_model/group1-shard1of1.bin
```

Finally, here's a webpage that uses TensorFlow.js to load the model,
then runs the model on input from the user:

```html
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js"></script>
<input type="number" id="modelInput" />
<span id="modelOutput"></span>
<script>
  const modelInputEl = document.getElementById("modelInput");
  const modelOutputEl = document.getElementById("modelOutput");
  (async () => {
    const model = await tf.loadGraphModel('./hello_model/web_model/model.json');
    modelInputEl.addEventListener("input", () => {
      const inputFloat = parseFloat(modelInputEl.value);
      tf.tidy(() => {
        modelOutputEl.innerText = model.predict(tf.tensor([inputFloat])).arraySync()[0];
      });
    });
  })();
</script>
```

<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js"></script>
<script>
  const modelInputEl = document.getElementById("modelInput");
  const modelOutputEl = document.getElementById("modelOutput");
  (async () => {
    const model = await tf.loadGraphModel('/assets/2021-03-09/web_model/model.json');
    modelInputEl.addEventListener("input", () => {
      const inputFloat = parseFloat(modelInputEl.value);
      tf.tidy(() => {
        modelOutputEl.innerText = model.predict(tf.tensor([inputFloat])).arraySync()[0];
      });
    });
  })();
</script>
