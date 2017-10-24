---
title: "Web Push API in Firefox"
---

When I was playing around with the Web Push API,
I worked exclusively with Google Chrome.
It looked like Google had spearheaded this browser feature,
and at some points they required the developer to interact with GCM/FCM.
It was pretty unclear how (or whether) any of this worked with Firefox.

I ran the following JavaScript in Firefox:

```js
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.subscribe({userVisibleOnly: true}).then(sub => {
    console.log("Subscription:", sub);
    window.sub = sub;
  });
})
```

Here's the subscription object I get:

```json
{
  "endpoint": "https://updates.push.services.mozilla.com/wpush/v1/<BIG_STRING>",
  "keys": {
    "auth": "<BIG_STRING>",
    "p256dh": "<BIG_STRING>"
  }
}
```

Compare this to the subscription object I get in Google Chrome:

```json
{
  "endpoint": "https://android.googleapis.com/gcm/send/<BIG_STRING>",
  "expirationTime":null,
  "keys": {
    "auth": "<BIG_STRING>",
    "p256dh": "<BIG_STRING>"
  }
}
```

What is `updates.push.services.mozilla.com`?
It's part of the [Mozilla Push Service](https://mozilla-push-service.readthedocs.io/en/latest/#architecture)!
Specifically, it's the domain that the server component of web applications can send notifications to.
There is another domain, `push.services.mozilla.com`,
that browsers holds open connections to, waiting for new pushes.

It looks like Google (?) are rolling out [several Web Push libraries](https://github.com/web-push-libs),
but there's no official Go library yet.
However, I was able to send a notification to this subscription
using [the Go library SherClockHolmes/webpush-go](https://github.com/SherClockHolmes/webpush-go).
This looks something like:

```go
package main
import (
	"bytes"
	"encoding/json"
	"log"
	webpush "github.com/sherclockholmes/webpush-go"
)
func main() {
	s := webpush.Subscription{}
  err := json.NewDecoder(bytes.NewBufferString(`{ THE JSON SUBSCRIPTION DATA }`)).Decode(&s)
	if err != nil {
		log.Fatal(err)
	}
	_, err = webpush.SendNotification(
    []byte(`{"method": "notification", "title": "Hello"}`),
    &s,
    &webpush.Options{ VAPIDPrivateKey: "MY VAPID KEY" }
  )
	if err != nil {
		log.Fatal(err)
	}
}
```
