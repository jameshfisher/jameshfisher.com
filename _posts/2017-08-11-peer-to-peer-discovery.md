---
title: How do peer-to-peer programs discover each other?
tags: []
---

In peer-to-peer systems like BitTorrent and Bitcoin, you start your local program on a networked computer, and you become connected to other instances of the same program running on lots of other computers. The local process starts listening on a local port, and finds IP:port pairs for those other processes. How does your process discover those "peer" addresses?

If the peer-to-peer system is purely decentralized, there is no better way to find a peer than to _search_. Decide on a specific port for your application. Have the new process send a "ping" packet to every address on the internet, until one replies with a "pong".

Once you find one peer, you can stop port-scanning: peers can share address information with each other. The peer you find can reply with all the addresses of the peers it knows. You can then connect to these peers, and repeat the process until you have "enough" peers.

This approach has one big problem: to find just one peer, you may have to send millions of "hello" packets. This is not good for your bandwidth, or for start-up latency, or for the network generally.

The only way to fix the "initial search" problem is to centralize. BitTorrent does this with "trackers". A `.torrent` file contains the URL of a tracker server for that file:

```
$ wget http://releases.ubuntu.com/17.04/ubuntu-17.04-desktop-amd64.iso.torrent
$ npm install --save bencode
$ node
> let bencode = require("bencode")
> bencode.decode(fs.readFileSync("ubuntu-17.04-desktop-amd64.iso.torrent")).announce.toString('utf8')
'http://torrent.ubuntu.com:6969/announce'
```

A GET request to that URL, with some info about the file you wish to download, gives you a list of peers you can connect to.

Bitcoin uses other centralized methods for peer discovery. An early mechanism was to connect to known IRC channels. Later, Bitcoin began using "DNS seeds". [The Bitcoin client is hardcoded with a list of domain names](https://github.com/bitcoin/bitcoin/blob/0.14/src/chainparams.cpp#L122-L127). The owners of these domain names maintain a set of `A` records which point to long-running Bitcoin peers. For example, `seed.bitcoinstats.com` resolves to a whole bunch of IPs:

```
$ dig seed.bitcoinstats.com

; <<>> DiG 9.8.3-P1 <<>> seed.bitcoinstats.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 6518
;; flags: qr rd ra; QUERY: 1, ANSWER: 25, AUTHORITY: 0, ADDITIONAL: 0

;; QUESTION SECTION:
;seed.bitcoinstats.com.		IN	A

;; ANSWER SECTION:
seed.bitcoinstats.com.	60	IN	A	104.247.230.28
seed.bitcoinstats.com.	60	IN	A	220.245.196.37
seed.bitcoinstats.com.	60	IN	A	138.197.109.21
seed.bitcoinstats.com.	60	IN	A	47.94.45.184
seed.bitcoinstats.com.	60	IN	A	14.52.209.177
seed.bitcoinstats.com.	60	IN	A	122.13.2.80
...
seed.bitcoinstats.com.	60	IN	A	138.68.64.102
seed.bitcoinstats.com.	60	IN	A	88.150.192.17
seed.bitcoinstats.com.	60	IN	A	76.187.118.123
seed.bitcoinstats.com.	60	IN	A	82.197.194.198
seed.bitcoinstats.com.	60	IN	A	78.40.244.243
seed.bitcoinstats.com.	60	IN	A	163.172.161.49

;; Query time: 269 msec
;; SERVER: 192.168.1.1#53(192.168.1.1)
;; WHEN: Sun Aug 13 23:40:52 2017
;; MSG SIZE  rcvd: 439
```
