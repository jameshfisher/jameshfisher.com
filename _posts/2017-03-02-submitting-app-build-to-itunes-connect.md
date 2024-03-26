---
title: How to submit an app build to iTunes Connect
justification: >-
  I'm releasing Vidrio this month. Part of the release process is build
  submission.
tags:
  - macos
  - app-development
  - app-distribution
  - app-store
  - xcode
  - ios
taggedAt: '2024-03-26'
---

I'm releasing Vidrio, a macOS app, to the Mac App Store. Part of the process is to submit a build of the application to iTunes Connect. Here's how.

In XCode, open the project, then "Product > Archive". This brings up the "Organizer" showing a new archived version of the app. On the right-hand side is an "Upload to App Store" button, but it's disabled. Why? Turns out I had the wrong "team" selected for signing the app.

Below the "Upload to App Store" button, there's a "Validate" button. Validation is computationally expensive!! My fan is running at 100% and my editor is struggling to display characters as I type them.

Finally, validation returned with a failure:

> iTunes Store operation failed.
> App sandbox not enabled. The following executables must include the "com.apple.security.app-sandbox" entitlement with a Boolean value of true in the entitlements property list: [( "io.vidr.Vidrio.pkg/Payload/Vidrio.app/Contents/MacOS/Vidrio" )] Refer to App Sandbox page at https://developer.apple.com/devcenter/mac/app-sandbox/ for more information on sandboxing your app.

That URL is broken. Fun times. So, what is "App Sandbox"? This system restricts macOS apps to their stated set of "entitlements", such as accessing the webcam, sending network requests, etc. Similar to permissions for mobile apps and browser plugins.

So, I'm required to use App Sandbox, and I need to tell it that Vidrio needs to access the webcam. This was easy: I selected my only "target", and under "Capabilities", enabled "App Sandbox". It then lists a bunch of capabilities, of which I only selected "Camera".

After "validating" again, it passed all checks, so I clicked "Upload to App Store". It spent a while, then:

> This action could not be completed. Try again. (-22421)

Hmm. I wonder if this is due to the ongoing problems with S3 which are breaking the entire internet. I'll try again in a while ...

... well, it worked the second time.

Next, I have to select the build from the "Prepare for Submission" page in iTunes Connect. After clicking "Save", it shows the icon from the build.

Weirdly, there's a separate "App Sandbox information" section in iTunes Connect, which is not populated from my build. I selected "com.apple.security.device.camera", with a brief description of why.

Finally, I just need an app description. Let's do that in another post.
