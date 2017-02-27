---
title: "Vidrio opacity slider"
justification: "I'm releasing Vidrio this month. The user needs a way to adjust opacity."
---

Yesterday I added a "menu bar" icon for Vidrio. Today I added an opacity slider to it. This lets the user change the opacity of their webcam layer.

An outstanding problem is that I can't safely let the user set their webcam opacity to 100%. Doing so completely hides all other UI elements, including the opacity slider, so the user is stuck looking at herself! My current workaround is to cap the opacity at 90%, but this isn't ideal. I think if the user sets the opacity to greater than 90%, a small button should appear over the webcam view, in order to reset the opacity.
