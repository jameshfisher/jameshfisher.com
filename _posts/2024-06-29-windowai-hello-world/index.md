---
title: "`window.ai` hello world"
tags: []
---

If you're running Chrome with the `window.ai` API,
here's a UI to prompt an LLM running locally in your browser:

<div>
  <div style="display: flex; flex-direction: column">
    <h3>Prompt</h3>
    <textarea id="prompt" placeholder="Enter a prompt" style="width: 100%; height: 100px;"></textarea>
    <div style="display: flex; flex-direction: row; gap: 10px;">
      <label>
        Top K:
        <input type="number" id="topK" value="1" min="1" max="100" step="1" style="width: 100%; margin-bottom: 10px;">
      </label>
      <label>
        Temperature:
        <input type="number" id="temperature" value="0.5" min="0" max="5" step="0.1" style="width: 100%; margin-bottom: 10px;">
      </label>
    </div>
    <button id="run" style="display: block;">Run prompt</button>
  </div>
  <div>
    <div>
      Status: <span id="status"></span>
    </div>
    <h3>Output</h3>
    <div id="output" style="border: 1px solid #ccc; padding: 10px; font-family: monospace;"></div>
  </div>
</div>

<script type="module" src="./script.js"></script>

I wrote these TypeScript type definitions for the API:

```ts
declare global {
  interface WindowOrWorkerGlobalScope {
    readonly ai?: {
      canCreateTextSession(): Promise<"readily" | "after-download" | "no">;
      createTextSession(
        options?: Partial<AITextSessionOptions>,
      ): Promise<AITextSession>;
      defaultTextSessionOptions(): Promise<AITextSessionOptions>;
    };
  }
}

type AITextSession = {
  prompt(input: string): Promise<string>;
  promptStreaming(input: string): AsyncIterable<string>;
  destroy(): void;
  clone(): AITextSession; // Not yet implemented!
};

type AITextSessionOptions = {
  topK: number;
  temperature: number;
};
```
