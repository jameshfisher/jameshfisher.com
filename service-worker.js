self.addEventListener("message", (ev) => {
  if (ev.data.method == "ping") {
    ev.source.postMessage("pong");
  }
});
