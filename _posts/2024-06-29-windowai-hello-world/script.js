const promptEl = document.getElementById("prompt");
const topKEl = document.getElementById("topK");
const temperatureEl = document.getElementById("temperature");
const outputEl = document.getElementById("output");
const runEl = document.getElementById("run");
const statusEl = document.getElementById("status");
if (!window.ai) {
    statusEl.textContent = "window.ai not available :(";
}
else {
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
        statusEl.textContent = "Ready";
    }
    runEl.addEventListener("click", run);
}
export {};
