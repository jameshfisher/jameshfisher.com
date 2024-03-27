---
title: Instance DNS in multi-tenant services
tags: []
---

"The cloud" is full of multi-tenant systems.
Users create apps/instances/projects/sites/etc,
each of which is supposed to appear as an isolated instance of the service.
But in reality, these instances are _multiplexed_ onto much fewer servers/clusters.

Therefore, something needs to determine which instances are on which clusters.
Given an instance, what cluster is it on?
There are several places in the system where you could ask and answer this question.

At Pusher (the company I work for),
the cluster is identified extremely early:
the developer has to hardcode the cluster in the clients that are to use it.
Instead, the cluster could be identified at runtime.
A central service could keep track of the app-to-cluster mapping,
and the clients would consult this service each time they use the app.

The hardcoded-cluster approach has some advantages: operational simplicity and no lookups.
But this approach has some significant disadvantages too:
more configuration for the user,
no central authority,
and difficulty in changing the cluster later.
I think this is why many other multi-tenant services use runtime lookup.
For example, Heroku does this.

Specifically, other multi-tenant services do runtime cluster lookup using DNS.
DNS is the ideal service for this:
it's designed for serving name-to-location mappings,
and it's supported everywhere.

Pusher already has DNS for each cluster.
For example, `ws-mt1.pusher.com` will resolve to one of many WebSocket servers in the cluster "mt1".
We'd like to reuse this existing configuration.
Our DNS app server should return a `CNAME` record,
referring the client to the specific cluster's domain.

Each Pusher cluster has not one domain, but a _set_ of domains.
For example, the cluster "mt1" has domains `ws-mt1.pusher.com`, `sockjs-mt1.pusher.com`, and `api-mt1.pusher.com`.
When the client queries the DNS server,
it needs to pass more than just the Pusher App ID;
it also needs to pass the specific service it wants (such as `ws`, `sockjs`, or `api`).

If Pusher were to support app DNS, each app would have its own domain.
Pusher apps are identified by an immutable App ID (which happens to be numeric).
As a domain, this could be like `123456.apps.pusher.com`.
But this domain also needs to identify the service, such as `ws`.
So let's format the domains as `ws-123456.apps.pusher.com`.

Thus our DNS server would take queries for domains of the form `service+"-"+app+".apps.pusher.com."`,
and would return `service+"-"+app+".apps.pusher.com. 300 IN CNAME "+service+"-"+clusterof(app)+".pusher.com."`

The `clusterof(app)` function would look up against a central database.
However, it would be infinitely cacheable, since the cluster for an app does not change.
