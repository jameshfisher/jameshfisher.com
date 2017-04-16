---
title: "Vidrio payment server"
justification: "I'm making Vidrio. I'm using Stripe to charge users. For that, I need a payment server."
---

[The Vidrio purchase page](https://vidr.io/purchase) currently posts its form data to `http://localhost:8080/pay`! To make this work, it needs to post to a payment server.

I want this at `https://payment.vidr.io/pay`. For this server, I'll use Heroku and Golang.

I'm using a "monorepo" with many other things in. This interacts badly with Heroku and Go. I'll develop this server in a separate repository.

I now have a server running at `https://vidrio.herokuapp.com/pay`, which is linked to from my payment form. At some point, I'll move this to a vidr.io domain (but with TLS this is $7/month on Heroku).
