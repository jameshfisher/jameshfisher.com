---
title: "Vidrio App Record"
justification: "I'm making Vidrio this month. To release it, Apple says I need an App Record."
---

Vidrio will be an app on the Mac App Store. To create it, I need an App Record on [iTunes Connect](https://itunesconnect.apple.com/) (which, as far as I can work out, is a central registrar for apps in the Apple ecosystem).

Trying to create a "New Mac App" on iTunes Connect tells me that I have no "eligible Bundle IDs for Mac apps". An App Record refers to a Bundle ID. Apparently one has to register a Bundle ID first. One registers a Bundle ID through the [Apple Developer Program account console](https://developer.apple.com/account/mac/identifier/bundle). Be sure to select "OS X" from the top drop-down! I created a new Bundle ID `io.vidr.Vidrio`.

App Records have unique names, and I already have an old App Record called "Vidrio", so I can't create another! Fortunately, names are mutable - though I didn't discover this for quite a while because the "My Apps" page doesn't update (iTunes Connect is a terrible buggy single-page app). I renamed the old one to "Vidrio Old", but unfortunately can't delete it, because deleting App Records is near-impossible (?).

I was then able to continue on iTunes Connect, creating an App Record for `io.vidr.Vidrio`. One part of the form asks for an "SKU" for the app. This is an immutable "Stock Keeping Unit", and "A unique ID for your app that is not visible on the App Store." I chose a UUID.

The App Record wants a "privacy policy" URL. I've pointed it to [https://vidr.io/privacy](https://vidr.io/privacy), which I'll create in a future post.

The App Record requires two categories: "primary" and "secondary". I chose "Business" and "Utilities". I want to target business people - they're frequently giving presentations, and they're monied.

The App Record wants a "price schedule". After some thought, I'm making the first version free. I plan to monetize the app with a subscription model - which Apple offers as a kind of in-app purchase. I will tackle this later.

After these basic details, I have to "prepare for submission":

* Screenshots. I did some last year. I might do these more carefully. I'm concerned that the screenshot with Spotify will be a problem in review.
* A marketing URL. https://vidr.io of course.
* A support URL. I'll create https://vidr.io/support in a future post.
* A description. I'll work on this in a future post.
