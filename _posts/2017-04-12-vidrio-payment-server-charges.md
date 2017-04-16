---
title: "Vidrio payment server: creating charges"
justification: "I've just created a dummy payment server. It should actually handle the payment request."
---

After creating the payment server for Vidrio, I need to get it to handle the Stripe charge request. To do so, I'm using [the Stripe Go library](https://github.com/stripe/stripe-go).

Here's a complete example of creating a charge using the Stripe Go library.

```go
package main
import (
  "fmt"
  "github.com/stripe/stripe-go"
  "github.com/stripe/stripe-go/client"
)
func main() {
  stripeClient := &client.API{}
  stripeClient.Init("SECRET_KEY", nil)
  chargeParams := &stripe.ChargeParams{
    Amount: 2000,
    Currency: "usd",
    Desc: "Some description",
  }
  chargeParams.SetSource("tok_12345678oiuytre")
  ch, err := stripeClient.Charges.New(chargeParams)
  if err != nil { panic(err) }
  fmt.Printf("OK, %#v\n", ch)
}
```

This is now integrated into the payment server. The server creates a Stripe charge based on the POST request from the client on [the Vidrio purchase page](https://vidr.io/purchase).
