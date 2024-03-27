---
title: How does GeoDNS work?
tags:
  - dns
  - networking
taggedAt: '2024-03-26'
summary: >-
  GeoDNS uses geo-IP to locate clients and connect them to the nearest server,
  reducing latency.
---

Say you're serving static files to clients and want to minimize their request latency. The latency between sending the request and receiving the response is mostly due to the distance between the client and your server, i.e. due to time spent by packets on the network. So the way to reduce this latency is to move your server closer to the client. But since your clients are all over the globe, this means you need many servers, spread all over the globe, so that clients can query the server closest to them. The question then arises: how can you connect a client to the server which is geographically closest to them?

One answer is GeoDNS. When a client queries your DNS server, the DNS server looks up the location of the client based on their public IP address in the DNS query packet. The DNS server finds the closest file server to this location, and returns this file server's IP address in the DNS answer.

This method relies on some method to resolve an IP address to a geographical coordinate. For instance, [geoiptool.com](https://geoiptool.com/) resolves my current IP to a coordinate that is within a kilometer of my real location. This technique is known as geo IP.

So how does geo IP work? All services use a database. The most popular is [GeoIP by MaxMind](http://dev.maxmind.com/geoip/), but there are others. They are available at various levels of granularity. A small one is [their IP-to-country database](http://geolite.maxmind.com/download/geoip/database/GeoLite2-Country-CSV.zip). One file in here is `GeoLite2-Country-Blocks-IPv4.csv`, which looks like:

```
network,geoname_id,registered_country_geoname_id,represented_country_geoname_id,is_anonymous_proxy,is_satellite_provider
1.0.0.0/24,2077456,2077456,,0,0
1.0.1.0/24,1814991,1814991,,0,0
1.0.2.0/23,1814991,1814991,,0,0
1.0.4.0/22,2077456,2077456,,0,0
1.0.8.0/21,1814991,1814991,,0,0
1.0.16.0/20,1861060,1861060,,0,0
1.0.32.0/19,1814991,1814991,,0,0
1.0.64.0/18,1861060,1861060,,0,0
...
```

The first column is an IP address range. The second column identifies the country. We can forget the other columns for now.

An example. My IP yesterday at the weekend was `185.30.54.157`. Since the lines are ordered, I can binary search for this, to find all the blocks `185.30.*.*`:

```
185.30.0.0/22,798544,798544,,0,0
185.30.4.0/22,130758,130758,,0,0
185.30.8.0/22,2635167,2635167,,0,0
185.30.12.0/22,2017370,2017370,,0,0
185.30.16.0/22,2017370,2017370,,0,0
185.30.20.0/22,6252001,6252001,,0,0
185.30.24.0/22,2635167,2635167,,0,0
185.30.28.0/22,3017382,3017382,,0,0
185.30.32.0/22,2921044,2921044,,0,0
185.30.36.0/22,272103,272103,,0,0
185.30.40.0/22,2017370,2017370,,0,0
185.30.44.0/22,3175395,3175395,,0,0
185.30.48.0/22,3017382,3017382,,0,0
185.30.52.0/22,2802361,2802361,,0,0
185.30.56.0/22,2750405,2750405,,0,0
185.30.60.0/22,3175395,3175395,,0,0
185.30.64.0/21,3175395,3175395,,0,0
185.30.72.0/22,2963597,2963597,,0,0
185.30.76.0/22,130758,130758,,0,0
185.30.80.0/22,3175395,3175395,,0,0
185.30.84.0/22,690791,690791,,0,0
185.30.88.0/22,587116,587116,,0,0
185.30.92.0/22,3017382,3017382,,0,0
185.30.96.0/22,2017370,2017370,,0,0
185.30.100.0/22,2623032,2623032,,0,0
185.30.104.0/22,2017370,2017370,,0,0
185.30.108.0/22,3175395,3175395,,0,0
185.30.112.0/22,3175395,3175395,,0,0
185.30.116.0/22,2017370,2017370,,0,0
185.30.120.0/22,3057568,3057568,,0,0
185.30.124.0/22,798544,798544,,0,0
185.30.128.0/21,3017382,3017382,,0,0
185.30.136.0/22,3190538,3190538,,0,0
185.30.140.0/22,2510769,2510769,,0,0
185.30.144.0/22,783754,783754,,0,0
185.30.148.0/22,102358,102358,,0,0
185.30.152.0/22,2661886,2661886,,0,0
185.30.156.0/22,2921044,2921044,,0,0
185.30.160.0/22,2623032,2623032,,0,0
185.30.164.0/22,2750405,2750405,,0,0
185.30.172.0/22,2960313,2960313,,0,0
185.30.176.0/22,2750405,2750405,,0,0
185.30.180.0/22,3175395,3175395,,0,0
185.30.184.0/22,2629691,2629691,,0,0
185.30.188.0/22,3175395,3175395,,0,0
185.30.192.0/22,2017370,2017370,,0,0
185.30.196.0/22,2510769,2510769,,0,0
185.30.200.0/22,690791,690791,,0,0
185.30.204.0/22,2750405,2750405,,0,0
185.30.208.0/22,3017382,3017382,,0,0
185.30.212.0/22,2635167,2635167,,0,0
185.30.216.0/22,3017382,3017382,,0,0
185.30.220.0/22,2017370,2017370,,0,0
185.30.224.0/22,3144096,3144096,,0,0
185.30.228.0/22,2017370,2017370,,0,0
185.30.232.0/21,2750405,2750405,,0,0
185.30.240.0/21,2510769,2510769,,0,0
185.30.248.0/22,248816,248816,,0,0
185.30.252.0/22,2802361,2802361,,0,0
```

To match the third and fourth octets of my IP address, we need to understand those IP address ranges. They are in "CIDR notation". The range `ip/n` after the slash matches any IP address whose first *n* bits match the first *n* bits of *ip*. For example, `1.0.64.0/18` matches any IP address whose first 18 bits match the first 18 bits of `1.0.64.0`. Since there are 32 bits in an IP address (in IPv4), the range `ip/n` contains `2^(32-n)` IP addresses. Thus a larger *n* corresponds to a smaller range; incrementing *n* halves the size of the range. A `ip/32` range contains just the one address `ip`; an `ip/0` range contains all addresses.

Most of the ranges above are `/22`s, which contain `2^(32-22)` = 1024 addresses each. There are some `/21`s, which contain 2048 addresses each. Both of these ranges are awkward to read, because they don't fall cleanly into an integral number of octets.

It so happens that my IP address, `185.30.54.157`, is in the following row, because `185.30.52.0/22` matches `185.30.54.157`:

```
185.30.52.0/22,2802361,2802361,,0,0
```

This gives me the country id `2802361`. What does this mean? MaxMind provide another file in the zip, `GeoLite2-Country-Locations-en.csv`, with rows like:

```
geoname_id,locale_code,continent_code,continent_name,country_iso_code,country_name
...
2658434,en,EU,Europe,CH,Switzerland
2661886,en,EU,Europe,SE,Sweden
2750405,en,EU,Europe,NL,Netherlands
2782113,en,EU,Europe,AT,Austria
2802361,en,EU,Europe,BE,Belgium
2921044,en,EU,Europe,DE,Germany
2960313,en,EU,Europe,LU,Luxembourg
2963597,en,EU,Europe,IE,Ireland
2993457,en,EU,Europe,MC,Monaco
...
```

So the country id for my IP address is **Belgium**. That's correct! I was at FOSDEM, a conference in Brussels.

Now, a more interesting question is: how do MaxMind construct their downloadable database? I'll cover that in a future blog post.
