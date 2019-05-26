---
title: "I can see your local web servers"
tags: ["programming", "security"]
---

How many web servers are running on your machine right now?
Do all of those development web servers have a secure login,
and restrictive CORS permissions?
You don't know?
Allow me to check for you:

<p id="local_checklist" class="checklist">
</p>

If you see any results like <span class="result bad">localhost:3000 is available!</span>,
you should secure whatever you have running on that port,
because all websites you visit have access to it - 
including the page you're reading!
It is not sufficient security to only bind to `127.0.0.1` (the "loopback interface"),
because there are untrusted programs running on your machine right now
that have access to the loopback interface.
Those untrusted programs are web pages!

The mistake is easily made.
Here's an example vulnerable app,
using [Express](https://expressjs.com/),
a popular web framework:

```js
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.get('/', (req, res) => 
  res.send('My personal admin site'));
app.listen(3000);
```

To make things worse,
many servers bind to `0.0.0.0`,
meaning the server is available from anywhere that can reach the machine.
For example, Express does this by default!
If you're at work right now,
you might have dozens of other employees on your local network.
We can scan for all of their exposed servers, too:

<p id="network_checklist" class="checklist">
</p>

If you see any results like <span class="result bad">192.168.0.4:3000 is available!</span>,
you should tell your colleague to secure whatever she has running on that port,
because it is accessible by all websites visited by all your colleagues!
It is not sufficient security to hide behind a NAT (e.g. your WiFi router),
because there are untrusted programs running on your network right now
that have access to every machine - 
again, those untrusted programs are web pages!

<style>
  span.result.bad { color: red; font-weight: bold; }
  span.result.bad a:link, span.result.bad a:visited { color: red; text-decoration: underline; }
  .checklist { background-color: yellow; max-height: 6em; overflow-y: scroll; }
</style>
<script>
  const localChecklist = document.getElementById("local_checklist");
  const networkChecklist = document.getElementById("network_checklist");
  const portsToTry = [
    80, 81, 88,
    3000, 3001, 3030, 3031, 3333,
    4000, 4001, 4040, 4041, 4444,
    5000, 5001, 5050, 5051, 5555,
    6000, 6001, 6060, 6061, 6666,
    7000, 7001, 7070, 7071, 7777,
    8000, 8001, 8080, 8081, 8888,
    9000, 9001, 9090, 9091, 9999,
  ];

  function logLine(checklist, text, className) {
    const span = document.createElement("span");
    span.innerHTML = text + " ";
    span.setAttribute("class", "result" + " " + className);
    checklist.appendChild(span);
    checklist.scrollTop = checklist.scrollHeight;
  }

  function timeoutPromise(ms, promise) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("TIMEOUT"));
      }, ms);
      promise.then(
        res => {
          clearTimeout(timeoutId);
          resolve(res);
        },
        err => {
          clearTimeout(timeoutId);
          reject(err);
        }
      );
    })
  }

  function getLocalNetworkPrefix(cb) {
    var RTCPeerConnection = window.RTCPeerConnection || webkitRTCPeerConnection || mozRTCPeerConnection;
    var peerConn = new RTCPeerConnection({'iceServers': [{'urls': ['stun:stun.l.google.com:19302']}]});
    var dataChannel = peerConn.createDataChannel('test');  // Needs something added for some reason
    peerConn.createOffer({}).then((desc) => peerConn.setLocalDescription(desc));
    peerConn.onicecandidate = (e) => {
      if (e.candidate == null) {
        cb(/(192\.168\.[0-9]+\.)[0-9]+/.exec(peerConn.localDescription.sdp)[1]);
      }
    };
  }

  function scanHost(hostname, checklist, cb) {
    logLine(checklist, `Scanning ${hostname} ...`, "");
    function loop(portIndex) {
      if (portIndex >= portsToTry.length) {
        logLine(checklist, `${hostname} complete.`, "");
        cb();
      } else {
        const port = portsToTry[portIndex];
        const url = `http://${hostname}:${port}`;
        timeoutPromise(2000, fetch(url)).then(
          response => {
            logLine(checklist, `<a href="http://${hostname}:${port}" target="_blank">${hostname}:${port}</a> is available!`, "bad");
            loop(portIndex+1);
          },
          e => {
            if (e.message == "TIMEOUT") {
              // Assume this host is unreachable. Don't waste time; go to the next host.
              logLine(checklist, `unreachable.`, "");
              cb();
            } else {
              loop(portIndex+1);
            }
          }
        );
      }
    }
    loop(0);
  }

  function scanNetwork(localNetworkPrefix) {
    logLine(networkChecklist, "Scanning network ...", "");
    function loop(lowByte) {
      if (lowByte > 255) {
        logLine(networkChecklist, `Network scan complete.`, "");
      } else {
        const hostname = localNetworkPrefix + lowByte;
        scanHost(hostname, networkChecklist, () => {
          loop(lowByte+1);
        });
      }
    }
    loop(1);
  }

  scanHost("localhost", localChecklist, () => {
    getLocalNetworkPrefix(prefix => {
      scanNetwork(prefix);
    })
  });
</script>
