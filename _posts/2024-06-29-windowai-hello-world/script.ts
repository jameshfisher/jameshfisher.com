export {};

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

const promptEl = document.getElementById("prompt") as HTMLTextAreaElement;
const topKEl = document.getElementById("topK") as HTMLInputElement;
const temperatureEl = document.getElementById(
  "temperature",
) as HTMLInputElement;
const outputEl = document.getElementById("output") as HTMLDivElement;
const runEl = document.getElementById("run") as HTMLButtonElement;
const statusEl = document.getElementById("status") as HTMLDivElement;

if (!window.ai) {
  statusEl.textContent = "window.ai not available :(";
} else {
  const ai = window.ai;
  statusEl.textContent = "window.ai available; loading ...";

  const options = await ai.defaultTextSessionOptions();
  topKEl.value = options.topK.toString();
  temperatureEl.value = options.temperature.toString();

  const canCreate = await ai.canCreateTextSession();
  statusEl.textContent = {
    readily: "Ready",
    "after-download": "Downloading model ...",
    no: "Cannot create session :(",
  }[canCreate];

  async function run() {
    statusEl.textContent = "Creating session ...";
    const session = await ai.createTextSession({
      topK: Number(topKEl.value),
      temperature: Number(temperatureEl.value),
    });
    const stream = session.promptStreaming(promptEl.value);
    statusEl.textContent = "Streaming response ...";
    for await (const version of stream) {
      outputEl.textContent = version;
    }
    statusEl.textContent = "Finished streaming; destroying session ...";
    session.destroy();
    statusEl.textContent = "Ready";
  }

  runEl.addEventListener("click", run);
}
