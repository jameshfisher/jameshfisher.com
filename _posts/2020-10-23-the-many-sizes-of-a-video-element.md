---
title: "The many sizes of a video element"
tags: ["programming", "web"]
---

What is th size of a `<video>`?
The browser has several APIs reporting widths and heights,
but they're all subtly different!
This blog post is a playground.
It gets your webcam stream and displays it in a `<video>` element.
You can change the size constaints that are applied,
and you can change the size of the displayed video.
Based on this,
the page shows the various widths and heights of the video
as reported by different browser APIs.
I'll follow this post with some analysis of what they all mean!

<p>
  <textarea id="videoMediaTrackConstraints" cols="40" rows="7">{
    "width": { "ideal": 320 },
    "height": { "ideal": 240 },
    "resizeMode": "crop-and-scale"
}</textarea>
</p>
<button onclick="startOrRestartStream()">Start/restart stream with constraints</button>
<button onclick="applyConstraints()">Apply constraints to running stream</button>

<p>
    <div style="resize: both; overflow: hidden; width: 500px; height: 300px;">
      <video id="webcam_video" loop muted autoplay style="width: 100%; height: 100%; object-fit: contain; position: relative; z-index: -1; background-color: #eee;"></video>
    </div>
</p>

<pre id="video_info" style="background-color: #eee"></pre>

<script>
  const webcamVideoEl = document.getElementById("webcam_video");
  const videoInfoEl = document.getElementById("video_info");

  let stream = null;
  let latestFrameMetadata = null;

  setInterval(function() {
    videoInfoEl.innerText = 
`videoTrack.getSettings().width = ${stream?.getVideoTracks()[0].getSettings().width}
videoTrack.getSettings().height = ${stream?.getVideoTracks()[0].getSettings().height}
videoTrack.getSettings().resizeMode = ${stream?.getVideoTracks()[0].getSettings().resizeMode}
requestVideoFrameCallback.metadata.width = ${latestFrameMetadata?.width}
requestVideoFrameCallback.metadata.height = ${latestFrameMetadata?.height}
webcamVideoEl.width = ${webcamVideoEl.width}
webcamVideoEl.height = ${webcamVideoEl.height}
webcamVideoEl.videoWidth = ${webcamVideoEl.videoWidth}
webcamVideoEl.videoHeight = ${webcamVideoEl.videoHeight}
webcamVideoEl.clientHeight = ${webcamVideoEl.clientHeight}
webcamVideoEl.clientWidth = ${webcamVideoEl.clientWidth}
webcamVideoEl.offsetHeight = ${webcamVideoEl.offsetHeight}
webcamVideoEl.offsetWidth = ${webcamVideoEl.offsetWidth}
webcamVideoEl.scrollHeight = ${webcamVideoEl.scrollHeight}
webcamVideoEl.scrollWidth = ${webcamVideoEl.scrollWidth}
`;
  }, 500);

  function onFrame(now, metadata) {
    latestFrameMetadata = metadata;
    webcamVideoEl.requestVideoFrameCallback(onFrame);
  }
  webcamVideoEl.requestVideoFrameCallback(onFrame);

  function startOrRestartStream() {

    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop();
      }
    }

    navigator.mediaDevices.getUserMedia({ 
        video: JSON.parse(document.getElementById('videoMediaTrackConstraints').value) 
    }).then(newStream => {
      stream = newStream;

      webcamVideoEl.srcObject = newStream;
      webcamVideoEl.play();

    }).catch(error => {
      console.error(error);
    });
  }

  function applyConstraints() {
    stream?.getVideoTracks()[0].applyConstraints(JSON.parse(document.getElementById('videoMediaTrackConstraints').value))
      .then(x => console.log("Applied constraints"))
      .catch(err => { throw err; });
  }
</script>