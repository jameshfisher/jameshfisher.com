---
title: "Playing with Stripe"
justification: "I want to monetize Vidrio. I'm investigating Stripe as an option."
---

I want to monetize Vidrio using product keys. One way to do this with a generic payment processor like Stripe. After my server receives notification of payment, it can generate a product key.

First, I'll play around with Stripe's API to see if it does what I expect. To use Stripe, I have to have client-side and server-side components. The client-side component is embedded in the vidr.io website or in the Vidrio app, and gathers user/card data. The server-side component interacts with my account on Stripe.com, e.g. to charge users.

The naive way to do payments is:

1. Client-side form gathers card data.
2. Form posts card data to my server.
3. My server sends card data to Stripe, requesting payment.

The naive way handles card data on my server, and this requires PCI DSS audits. My server should never handle card data, so Stripe does that for me. To do so, Stripe adds an indirection:

1. Client-side form gathers card data.
2. Form posts card data and amount to Stripe, getting back a _token_.
3. Form posts token to my server.
4. My server sends token to Stripe, requesting payment.

The _token_ is an IOU. The IOU can be cashed in by my server.

The simplest way to implement steps 1-3 is using [Checkout](https://stripe.com/docs/checkout), a frontend library which creates the form. This form submits the token to a URL of my choice (my server-side component).

I'm currently using Firebase for static file hosting, and I have no other server components. I need to set up a payment server. Here's a simple Go web server which accepts the post and prints it out:

```go
package main

import (
  "fmt"
  "net/http"
  "io/ioutil"
)

func payHandler(w http.ResponseWriter, r *http.Request) {
  bs, err := ioutil.ReadAll(r.Body)
  if err != nil { panic(err) }
  fmt.Printf("request body: %#v\n", string(bs))
}

func main() {
  http.HandleFunc("/pay", payHandler)
  http.ListenAndServe(":8080", nil)
}
```

When pointing the Stripe form at this server, I get:

```
$ go run main.go
request body: "stripeToken=tok_AU9TDPyBgwgzcQ&stripeTokenType=card&stripeEmail=jameshfisher%40gmail.com"
```

This server should additionally process the token, then serve the user an appropriate page.

To process the token, the server must make a request like this:

```
$ curl https://api.stripe.com/v1/charges -u 75wyu65u7euw4y53: -d amount=2000 -d currency=usd -d description="Vidrio product key" -d source=tok_AU9TDPyBgwgzcQ
{
  "object": "charge",
  "amount": 2000,
  ...
  "captured": true,
  "card": {
    ...
    "name": "jameshfisher@gmail.com",
    ...
  },
  ...
  "source": {
    ...
    "name": "jameshfisher@gmail.com",
  },
  ...
}
```

It's not clear what the relationship is between the "2000 cents" in the client-side form and the "2000 cents" in the server charge-creation request.

I created [the Vidrio purchase page](https://vidr.io/purchase). It just uses my Stripe test credentials for now.

Future tasks:

* Create payment server. Use [the Stripe Go library](https://github.com/stripe/stripe-go).
* To actually receive payment, I need a company number!
