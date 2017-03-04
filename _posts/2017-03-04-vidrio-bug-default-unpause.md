---
title: "Vidrio bug: pause toggle text wrong after unpausing by setting to default opacity"
justification: "I'm making Vidrio. Prioritize bug fixes!"
---

Vidrio now has a pause/unpause feature. When paused, one can implicitly unpause it by changing the opacity. But if doing this with the "default opacity" button, the text of the pause/unpause toggle gets out of sync: it still reads "unpause", even though we unpaused it by changing the opacity.

This bug is now fixed.
