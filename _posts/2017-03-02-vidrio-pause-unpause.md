---
title: "Vidrio should have a pause/unpause feature"
justification: "I'm working on simple features for Vidrio 1.1."
---

I would like Vidrio to sit in the user's menu bar all the time, even when they're not using it. The UX argument for this is convenience - you don't have to restart it. The selfish argument is awareness - I want the user to always have Vidrio visible.

The user _can_ leave Vidrio on all the time at the moment. They can turn opacity down to 0%, at which point the program turns off the webcam. But the natural action is to quit the program, instead of turning down the opacity. I want to prompt the user to _pause_ the program instead of quitting.

I've implemented this. There's a bit of subtlety around storing the old opacity when setting it to 0%. An `enum` type would help here.
