---
title: "Apple Store release process"
justification: "I'm releasing Vidrio on the Mac App Store, so I need to know the process!"
---

I made an app called Vidrio. It's a macOS app, and it's going to be available on the Mac App Store. Just like [this example (Numbers, an app made by Apple)](https://itunes.apple.com/gb/app/numbers/id409203825). I've never released to the App Store before.

![stolen image](https://developer.apple.com/library/content/documentation/IDEs/Conceptual/AppDistributionGuide/Art/1_administration_tasks_2x.png)

Step 1 is to enroll in the Apple Developer Program. The Apple Developer Program lets you publish apps to all stores for all Apple operating systems: macOS, iOS, watchOS, tvOS. I enrolled back in October, but since paused the project. I'm picking it up again now.

Step 2, according to the diagram, is to develop the app. This is done - at least, it's an MVP. A possible remaining task is to monetize the app. I wish to use a subscription model for it. I don't know how to do this, and I'll cover it in another post.

Step 3: the diagram tells me to create an "App Record" using [iTunes Connect](https://itunesconnect.apple.com/). iTunes Connect is the central location for tracking "apps" in the Apple ecosystem. Behold how far from a music player iTunes has become. I registered an App Record last year, but I need to do it again. My bundle ID uses the domain `vidrioapp.com`, but recently I bought `vidr.io`, which I am going to use as the official domain. Before doing this, I'm going to set up a holding site at vidr.io. I'll describe this in a future post.

Step 4: upload the app. This sounds trivial. Step 5, "beta testing", sounds skippable. Step 6, "submitting", sounds trivial, but this is where App Review comes into play; I'll describe App Review in a future post. Step 7, "releasing", also sounds trivial.

My main work is around:

* creating vidr.io site
* figure out how to charge for Vidrio (Subscriptions? In-app purchases?)
* recreate App Record
* submission and app review

Next step today: bring up a placeholder website.
