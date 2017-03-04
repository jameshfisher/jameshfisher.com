---
title: "Adding a developer account to XCode"
justification: "I'm making Vidrio with XCode. I've just switched to my new MacBook Pro, which doesn't want to build Vidrio."
---

I just switched to my new MacBook Pro (the one with the touch bar - a feature I'll be adding to Vidrio). I cloned the Vidrio repository, and attempted to build it with XCode, but XCode complains:

> Check dependencies
>
> Add your developer account to Xcode:  There are no accounts registered with Xcode.
> No signing certificate "Mac Development" found:  No "Mac Development" signing certificate matching team ID "[omitted]" with a private key was found.

XCode needs to sign in with my Apple ID. You can see listed accounts under `XCode > Preferences > Accounts`.

After signing in, I have the choice of two "teams" in the code-signing config for Vidrio. These teams are "James Fisher" and "James Fisher (Personal team)". What are these things, what are "teams" anyway, and what's the relationship to my Apple ID?

Team = "development team", and these are identified by their own ID. The development team is identified in my `Vidrio.xcodeproj/project.pbxproj`. I was building with the "James Fisher" team, and not the "personal team".

When selecting the team, XCode said it generated a new signing certificate. This new certificate is listed in [my macOS certificates in my Developer Program account](https://developer.apple.com/account/mac/certificate/). I then received an email telling me that

> Your Certificate Has Been Revoked
>
> Any provisioning profiles that include this certificate are no longer valid and must be regenerated for future use.

I assume this refers to the signing certificate on my old MacBook Pro. However, these certificates are still listed in the web dashboard, and don't say that they're revoked.

This whole code-signing process is mysterious.
