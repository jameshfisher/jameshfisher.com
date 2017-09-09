self.addEventListener("message", (ev) => {
  if (ev.data.method == "ping") {
    ev.source.postMessage("pong");
  } else if (ev.data.method == "notify") {
    self.registration.showNotification(ev.data.title, ev.data.options);
  }
});

self.addEventListener("sync", (ev) => {
  self.registration.showNotification("Syncing!");
});

self.addEventListener("push", (ev) => {
  self.registration.showNotification("Received push!");
});

self.addEventListener("fetch", (ev) => {
  // Pass-through; browser should do its normal thing.
  // This is here to pass Chrome's tests for adding a web app to the home screen.
});
