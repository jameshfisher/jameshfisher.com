---
title: "Strava route builder API"
tags: ["programming"]
---

The [Strava Route Builder](https://www.strava.com/routes/new) lets you build cycling and running routes.
It's backed by an API at `https://www.strava.com/routemaster/route`.
I wanted to use this API for my own purposes, but it's undocumented,
so here are some hints.

The Route Builder takes as input a set of waypoints.
You draw these on the map by clicking.
For the route between two waypoints,
the app makes a call to the API.
Given two points,
like `{ lat: 51, lng: 0 }`,
you can get the route between them with this JS:

```js
function routeBetweenPoints(a, b) {
  return fetch('https://www.strava.com/routemaster/route', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-CSRF-Token': document.getElementsByName('csrf-token')[0].getAttribute('content')
    },
    body: JSON.stringify({
      elements: [
        { element_type: 1, waypoint: { point: a } },
        { element_type: 1, waypoint: { point: b } }
      ],
      preferences: {
        popularity: 1,
        elevation: 0,
        route_type: 1,
        straight_line: false
      }
    })
  }).then(response => response.json());
}
```

This will only work within the Route Builder,
because it needs access to `csrf-token` in the DOM.
You can paste it into the console on the Route Builder page.
Alternatively, you can get your own CSRF token, and call the API from a script.
I leave this to you to achieve.