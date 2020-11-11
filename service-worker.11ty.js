exports.data = {
  permalink: "service-worker.js",
};

exports.render = (data) => `
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
  let data = ev.data.json();
  if (data.method === "notification") {
    self.registration.showNotification(data.title, data.options);
  } else {
    console.log("Received push with unknown method: ", data, ev);
  }
});

self.addEventListener("notificationclick", (ev) => {
  clients.openWindow("https://jameshfisher.com/");
});

self.addEventListener("fetch", (ev) => {
  // Pass-through; browser should do its normal thing.
  // This is here to pass Chrome's tests for adding a web app to the home screen.
});
`;