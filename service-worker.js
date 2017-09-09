self.addEventListener("message", (ev) => {
  if (ev.data.method == "ping") {
    ev.source.postMessage("pong");
  } else if (ev.data.method == "notify") {
    self.registration.showNotification(ev.data.title, ev.data.options);
  }
});
