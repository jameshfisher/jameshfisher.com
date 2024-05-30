---
title: "Interactive Turing patterns in WebGPU"
tags:
  - programming
  - webgpu
---

Below is an interactive Turing pattern.
It follows [Karl Sims' model](https://www.karlsims.com/rd.html).
It's implemented in WebGPU.

<div>
  <canvas id="example-canvas" width="600" height="600"></canvas>
</div>

<div>
  <label for="feed-rate">Feed Rate: </label>
  <input type="range" id="feed-rate" name="feed-rate" min="0" max="0.1" step="0.001" value="0.055">
  <span id="feed-rate-value">0.055</span>
</div>
<div>
  <label for="kill-rate">Kill Rate: </label>
  <input type="range" id="kill-rate" name="kill-rate" min="0" max="0.1" step="0.001" value="0.062">
  <span id="kill-rate-value">0.062</span>
</div>

<script type="module" src="script.js"></script>
