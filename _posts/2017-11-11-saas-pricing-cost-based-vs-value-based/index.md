---
title: 'SaaS price models: cost-based pricing vs. value-based pricing'
summary: >-
  Cost-based pricing sets prices to cover costs plus profit, while value-based
  pricing sets prices based on customer willingness to pay. The optimal SaaS
  pricing model uses value-based inputs like user count that approximate
  customer value.
tags:
  - cost-based-pricing
  - value-based-pricing
  - pricing
  - product-management
  - saas
taggedAt: '2024-04-12'
---

You run a software-as-a-service business.
Let's say it's a business chat app.
Because you're a business,
you want to charge money for the service.
But how much do you charge?

Here's one strategy:
determine your costs,
then pass those costs on to your customers, plus some profit.
This is "cost-based pricing",
or "cost-plus pricing" (cost plus profit = price).
In your case,
you pay per MB-month for storage,
per MB for network,
and per second for CPU.
Multiply these by your profit margin,
and you have your price model.

You don't want to price your product in these units,
because your customers don't understand megabytes, CPU-hours, et cetera.
Instead, you use customer-facing units which approximate these costs:
"number of images saved", "number of messages sent", or "$5/month extra for TLS".
But the principle is the same,
and this is still a cost-based price model.

I've found people reach for cost-based pricing first.
But there is another approach to pricing:
"value-based pricing".
Where cost-based pricing approximates your costs,
value-based pricing approximates _how much money the customer is willing to spend_.
A value-based model is "better" than a cost-based price model
if the perceived value is higher than the cost -
which, in a viable business, should be the case!

So you want value-based pricing for your business chat app service.
But how do you determine how much the customer is willing to spend?
Think for a second, and you'll find an immediate problem with the question:
just who is "the customer"?
You have many customers!
Because cost-based pricing is uniform,
the costs do not vary by customer.
But perceived value, and willingness to spend, vary considerably by customer.
Under a value-based price model, your price should be different for each customer!

The ultimate value-based price model is "price-on-request".
You wait for a customer to request your price,
then decide how much they're willing to spend.
Say you get this email:

> From: Bob Jones `<bob.jones@microsoft.com>`<br/>
> Subject: How much do you charge?
>
> Hi, we're evaluating your service compared to some others.
> I couldn't see your prices on your site.
> Could you help? Bob.

How much is Bob willing to spend?
You notice the email is from `microsoft.com`,
and they have money to spend,
so maybe they're not very price-conscious.
But Bob also explicitly asks about prices,
rather than about features,
so maybe he is price-conscious after all.
He doesn't sound that enthusiastic,
so maybe he's willing to go elsewhere and we're competing on price.
Where cost-based pricing is a science,
value-based pricing can be more of an art form.

Price-on-request is not scalable.
You need to reply to every interested party.
For most SaaS companies, this is not feasible,
so price-on-request is usually reserved for "big customers".
You must find a more scalable value-based price model.
This means each potential customer must be able to calculate their own price.
Maybe you could give them the following form:

> ☑︎ Your company is rich: +$1000/year<br/>
> ☑︎ You're highly enthusiastic about the product: +$500/year<br/>
> ☑︎ You had a bad experience with competitor: +$300/year<br/>
> ☑︎ You have a history of abusing customer support: +$500/year<br/>
> ☑︎ You speak in an educated manner: +$200/year

There are obvious problems here!
The customer can game your system: are they really enthusiastic?
The questions are subjective: what is a "bad" experience?
The form is discriminatory:
you can't charge differently based on how someone talks!
Your internal proxies for "willing to spend money" are inappropriate,
because they're subjective, unverifiable, discriminatory, complex,
and irrelevant to the customer's use of the product.

Think back to your cost-based pricing inputs:
"number of images saved", "number of messages sent", or "added TLS".
These inputs are objective, verifiable, simple, and related to the customer's use of your chat app.
But these inputs are not necessarily value-based:
the customer does not value the product more based on how many messages they send.
Your value-based pricing model must _look like_ a cost-based pricing model,
but must use inputs which are proxies for how much the customer is willing to spend,
instead of being proxies for cost.

For your business chat app,
there is at least one input which satisfies these criteria:
_number of users_.
The number of users approximates the size of the company,
thus how much it has to spend,
thus how much it is willing to spend.
The number-of-users metric is objective, verifiable, simple, and related to use.
Outwardly, number-of-users looks like cost-based pricing,
but is designed to approximate the customer's willingness to spend.

Per-user pricing is very popular in SaaS business for this reason.
Google "G Suite" charges £3.30 per user per month.
PubNub charges 10 cents per device per month.
Zendesk charges £5 per agent per month.
Slack charges £6.30 per active user per month.

So you price your chat app at $5 per user per month.
But don't forget about your costs!
A customer could game your system
by creating a single-user chat app,
and having all of their employees log in as the same user,
generating millions of messages and images.
They'll be a big cost to you, but pay almost nothing.
The standard solution to this is _limits_.
Instead of charging per message, you set a message limit per user.
Instead of charging per stored image, you set an image limit per user.

Maybe in your business, the proxies for cost are similar to the proxies for value.
For example, you're starting a cloud computing company,
where your cost is in CPU-hours,
and your customers value you based on CPU-hours.
You might think this coincidence is excellent:
you get to extract the maximum from your customer,
while ensuring you cover your costs.
But beware!
This coincidence probably means you're in a competitive commodity market,
where profits are poor.

You want to be in markets where
the proxies for value are wildly different to the proxies for cost.
Consider starting a certificate authority.
A CA's costs are near zero:
their computers verify DNS challenges, then sign messages.
But customers value the CA based on a radically different metric:
trust by humans, by browsers, and by operating systems.
