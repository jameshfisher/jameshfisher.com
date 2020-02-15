var counter = 0;
this.addEventListener("message", (ev) => {
  {
    add: () => {
      counter += ev.data.amount;
    },
    get: () => {
      this.postMessage(counter);
    }
  }[ev.data.command](ev.data);
  counter += ev.data;
});
