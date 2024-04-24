---
title: Measuring audio volume in JavaScript
summary: >-
  A demo of real-time microphone volume measurement using the Web Audio API's
  `AnalyserNode`.
tags:
  - web-audio-api
  - audio
  - volume
  - javascript
  - web-development
  - web-apis
  - web
  - programming
taggedAt: '2024-04-12'
---

Click <button id="startButton">Start measuring</button>,
and this meter will show your microphone volume level:
<meter id="volumeMeter" high="0.25" max="1" value="0"></meter>.
This demo uses the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).
Here is the essential code:

```js
const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
const audioContext = new AudioContext();
const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream);
const analyserNode = audioContext.createAnalyser();
mediaStreamAudioSourceNode.connect(analyserNode);

const pcmData = new Float32Array(analyserNode.fftSize);
const onFrame = () => {
    analyserNode.getFloatTimeDomainData(pcmData);
    let sumSquares = 0.0;
    for (const amplitude of pcmData) { sumSquares += amplitude*amplitude; }
    volumeMeterEl.value = Math.sqrt(sumSquares / pcmData.length);
    window.requestAnimationFrame(onFrame);
};
window.requestAnimationFrame(onFrame);
```

The Web Audio API is a kind of ["filter graph API"](https://en.wikipedia.org/wiki/Filter_graph).
This means that in JavaScript,
we create nodes in a directed graph to say how the audio data flows
from sources to sinks.
(There is still no equivalent API for video.
To process video on the web,
we have to use hacky invisible `<canvas>` elements.)

Our `new AudioContext()` is the graph.
We create new nodes in the graph by calling methods on it like `n1 = audioContext.createXYZ(...)`.
A node can have multiple inputs and outputs.
for example, a `ChannelMergerNode` merges multiple audio sources into one;
therefore it has has multiple inputs and one output.
A node's inputs and outputs are numerically 0-indexed;
for example, a `audioContext.createChannelMerger(5)` has five inputs with indexes `0` through `4`,
and one output with index `0`.
We link a node `n1`'s output `i` to a node `n2`'s input `j` by calling `n1.connect(n2, i , j)`.

Our particular audio graph will look like this:

```
+--------------------------------------------------------+
|                       AudioContext                     |
|                                                        |
|  +----------------------------+                        |
|  | MediaStreamAudioSourceNode |                        |
|  +------------0---------------+                        |
|               |                                        |
|               v                                        |
|        +------0-------+      +-----------0----------+  |
|        | AnalyzerNode |      | AudioDestinationNode |  |
|        +--------------+      +----------------------+  |
+--------------------------------------------------------+
```

Note an `AudioContext` always has a node at `audioContext.destination`.
It's an `AudioDestinationNode` which plays to the default system speakers.
To play audio, we would connect a node to the input of this destination.
However, our task here is not to play audio, only to analyze it.
Therefore, we will not link anything to `audioContext.destination`.

An `AnalyzerNode` lets you ask for a snapshot of the audio data.
We do that repeatedly with `requestAnimationFrame`, then analyze it and display it in our volume meter.
You can ask for frequency-domain data or time-domain data.
We define "volume" as the root mean square of the amplitude,
just using the time-domain data.
(We could define volume in other ways.
If we wanted to determine whether someone is speaking,
it may make more sense to analyze frequency-domain data,
and restrict to human voice frequencies.)

Note: the main other demo on the web is [this "audio stream volume" example](https://webrtc.github.io/samples/src/content/getusermedia/volume/).
However, it's from 2015 and uses the deprecated [`ScriptProcessorNode`](https://developer.mozilla.org/en-US/docs/Web/API/ScriptProcessorNode) API.

<script>
    const volumeMeterEl = document.getElementById('volumeMeter');
    const startButtonEl = document.getElementById('startButton');
    startButtonEl.onclick = async () => {
        startButtonEl.disabled = true;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const audioContext = new AudioContext();
        const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream);
        const analyserNode = audioContext.createAnalyser();
        mediaStreamAudioSourceNode.connect(analyserNode);

        const pcmData = new Float32Array(analyserNode.fftSize);
        const onFrame = () => {
            analyserNode.getFloatTimeDomainData(pcmData);
            let sumSquares = 0.0;
            for (const amplitude of pcmData) { sumSquares += amplitude*amplitude; }
            volumeMeterEl.value = Math.sqrt(sumSquares / pcmData.length);
            window.requestAnimationFrame(onFrame);
        };
        window.requestAnimationFrame(onFrame);
    };
</script>
