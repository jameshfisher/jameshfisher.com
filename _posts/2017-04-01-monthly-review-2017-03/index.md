---
title: 'Monthly review: 2017-03'
justification: 'Each month, I write a monthly review. It''s a look back and a look forward.'
tags: []
summary: >-
  Completed Vidrio release in March, but fell short on other goals. Focused
  heavily on Vidrio development and marketing, rather than technical learning.
  Plans to continue Vidrio work and study OpenSSL, iptables, NAT, OAuth, and
  payment systems in April.
---

See [the previous monthly review](/2017/03/01/monthly-review-2017-02/).

My plan for March had the following three items: Complete paperlessness; Find a regular 17:00 activity; and Release Vidrio. Of these, I completed one: release Vidrio. I'm pretty happy with 1/3, because releasing Vidrio was the most important item on my list. I marked March out as "the month of Vidrio", and followed through with that.

In March, I tried out a new blogging mechanism: adding a "justification" property to each post. The intention was to prompt me to consider whether the day's effort is aligned with my general goals. I think the "justification" property was very successful in keeping me focussed. There were two common justifications in March: learning SSL (seven posts), and making Vidrio (36 posts!). Very few posts did not fall into these categories. I will certainly continue with the "justification" mechanism, and perhaps write a post about it.

What was I doing on Vidrio? First, figuring out Apple app development stuff: Apple Developer Program, iTunes Connect, "app records", privacy policy, app submissions, review process. Then  Figuring out Swift/Cocoa APIs: `NSApplicationMain`, XIB files, `NSApplication` (... this is a rabbit-hole). I worked on some Vidrio features: a menu bar icon, app icons, an opacity slider, pause/unpause, turning webcam on/off, monitoring screen resolution, fixing bugs, and some experiments with the touch bar (unmerged because the Touch Bar API does not allow us to register a new non-focussed application). The rest was Vidrio marketing: formulating a marketing strategy (I wish to rewrite this), creating [the Vidrio website](https://vidr.io), app description for App Store, "Made with Vidrio", creating [the Vidrio Slack team](https://vidrioapp.slack.com), and most recently creating [the Vidrio promo video](https://youtu.be/b0DP6UhlxeI). The work on Vidrio feels like primary an exercise in marketing. Probably less than 20% of my time on Vidrio has been spent coding.

In April, I'll be continuing work on Vidrio. I want to concentrate on getting people to pay for Vidrio, and tightening up the website to market Vidrio.

I also listed some technical things to learn in March: NAT, SSL, `lsof`, basic electronics, SCTP, assembly. I did none of these except SSL, where I have begun by walking through the `openssl` CLI tool. I'm removing some items from this list: electronics, SCTP, and assembly. I wish to continue focussing on UNIX and networking.

I tried various OpenSSL commands. `enc` does private-key encryption. `rand` generates random bytes. `s_client` connects to a TCP port running SSL. `passwd` does password hashing, but poorly. `dgst` produces message digests (and can sign messages with an HMAC). I then started looking at OpenSSL's public-key crypto tools, which are more interesting. I did key generation with `genrsa` and `rsa`. I did RSA encryption/decryption and signing/verification using `rsautl`. Next, I want to concentrate on OpenSSL's certificate facilities. I'd like to do this by creating my own (fake) CA.

Other technical things I would like to cover in April: OpenSSL, iptables, NAT, OAuth, payment systems.
