---
title: MediaRecorder hello world
tags:
  - programming
  - web
summary: >-
  The MediaStream Recording API converts a MediaStream to a
  Blob of compressed video and audio. A demo where you can record a 5-second clip.
---

[The MediaStream Recording API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API)
lets you convert a `MediaStream` to a `Blob` containing compressed video and audio.
Here's a hello world.
Click the <button id="recordButton">Record</button> button,
and this page will record a 5-second clip from your camera and microphone,
then present it back for you to replay.

<div id="recordings"></div>

You first need a `MediaStream`,
which you can get from many places,
but here's one method:

```js
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
```

Next, you instantiate a `MediaRecorder` with the `stream`:

```js
const recorder = new MediaRecorder(stream);
```

There are various options for how to encode the video,
but we'll leave it at the defaults.

The `MediaRecorder` provides data in a `dataavailable` event
which contains a `Blob`.
This event can happen many times.
Each event contains a chunk of the recording since the previous event.
The frequency of the `dataavailable` event depends on on how we configure the `MediaRecorder`.
We can configure it to only provide a chunk once,
but in general there are many chunks,
so let's assume that,
and keep an array of all the chunks:

```js
const chunks = [];
recorder.ondataavailable = e => chunks.push(e.data);
```

Once all the chunks have been provided,
we get a `stop` event.
Here, we concatenate our chunks into one video `Blob`,
then set it as the source of a `<video>` element:

```js
recorder.onstop = e => {
  const totalBlob = new Blob(chunks, { type: chunks[0].type });
  const url = URL.createObjectURL(totalBlob);
  const playbackVideoEl = document.createElement("video");
  playbackVideoEl.controls = true;
  playbackVideoEl.src = url;
  recordingsWrapperEl.appendChild(playbackVideoEl);
};
```

Nothing will happen yet!
We need to start the recorder:

```js
recorder.start(1000);
```

Still nothing will happen!
We're accumulating chunks,
but at some point we need to tell the `MediaRecorder` stop,
at which point it will generate any remaining chunks,
and finally the `stop` event.
Here I stop the recording after 5 seconds:

```js
setTimeout(() => recorder.stop(), 5000);
```

One "interesting" issue I found was that the audio and video are sometimes not synced.
I don't know if this is a bug in Chrome.
I was able to avoid this behavior by introducing a 1-second delay between getting the `stream`
and starting the `MediaRecorder`.
Something to investigate.

<script>
  const recordButtonEl = document.getElementById("recordButton");
  const recordingsWrapperEl = document.getElementById("recordings");
  let recordingState = "inactive";
  recordButtonEl.onclick = async () => {
      if (recordingState !== "inactive") {
          return;
      }
      recordingState = "setting-up";
      recordButtonEl.innerText = "Setting up ...";
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      // If we start recording immediately, the audio and video are sometimes not synced!
      // TODO investigate
      setTimeout(() => {
          recordingState = "active";
          recordButtonEl.innerText = "Recording ...";
          const recorder = new MediaRecorder(stream);
          const chunks = [];
          recorder.ondataavailable = e => {
              const blob = e.data;
              chunks.push(blob);
              console.log("Got data", blob.type);
          };
          recorder.onstop = e => {
              for (const track of stream.getTracks()) {
                  track.stop();
              }
              const totalBlob = new Blob(chunks, { type: chunks[0].type });
              const url = URL.createObjectURL(totalBlob);
              const playbackVideoEl = document.createElement("video");
              playbackVideoEl.controls = true;
              playbackVideoEl.src = url;
              recordingsWrapperEl.appendChild(playbackVideoEl);
              recordingState = "inactive";
              recordButtonEl.innerText = "Record";
          };
          recorder.start(1000);
          setTimeout(() => recorder.stop(), 5000);
      }, 1000);
  };
</script>
