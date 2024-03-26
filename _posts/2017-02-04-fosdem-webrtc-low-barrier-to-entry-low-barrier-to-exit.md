---
title: 'WebRTC - low barrier to entry, low barrier to exit?'
tags:
  - webrtc
  - web
taggedAt: '2024-03-26'
---

Summary:

> I told you last year that WebRTC was easy. It's not! Here are things you'll need to do yourself. They break down into API, protocol, infrastructure, and signaling. First, WebRTC is a standard, not an implementation, so it's full of spec ambiguities and inconsistent implementations! In the browser API, there are lots of deliberate inconsistencies due to browser prefixes; we need lots of code to work around these (e.g. `adapter.js`). More concerning are the accidental inconsistencies; it's not just a case of removing the prefixes!
After you've smoothed out the browser APIs, you have to deal with protocol inconsistencies. Two browsers working well might not work so well when talking to each other. The obvious cause here is that every browser has a slightly different set of codecs it can use, or wants to use.
You also have end-user problems, e.g. WebRTC is disabled on many browsers. In terms of infrastructure, the obvious things you need to provide are signaling channels and TURN servers. Potentially you will also want servers for recording and transcoding. There are very few tools for testing/debugging WebRTC: when a connection fails, it's hard for the user/developer to find out where in the stack it failed. Finally WebRTC does no "business" logic for you - it only provides for setting up a 1:1 connection, but does nothing for organizing those communications (e.g. making a group chat, or making a "queue" of people waiting to talk to a technician).
