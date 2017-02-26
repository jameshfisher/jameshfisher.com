---
title: "How do I create the AppIcon for my app?"
justification: "I'm making Vidrio this month. It's complaining about misconfigured AppIcons, which I don't understand."
---

I have several complaints in XCode like this:

> /Users/jim/dev/vidrio/Vidrio/Assets.xcassets: AppIcon.appiconset/512-1.png is 256x256 but should be 512x512.

Here's how my files are organized. XCode did a lot of this for me.

```
Vidrio.xcodeproj/project.pbxproj
Vidrio.xcodeproj/project.xcworkspace/contents.xcworkspacedata
Vidrio/Assets.xcassets/AppIcon.appiconset/1024.png
Vidrio/Assets.xcassets/AppIcon.appiconset/128.png
Vidrio/Assets.xcassets/AppIcon.appiconset/16.png
Vidrio/Assets.xcassets/AppIcon.appiconset/256-1.png
Vidrio/Assets.xcassets/AppIcon.appiconset/256.png
Vidrio/Assets.xcassets/AppIcon.appiconset/32-1.png
Vidrio/Assets.xcassets/AppIcon.appiconset/32.png
Vidrio/Assets.xcassets/AppIcon.appiconset/512-1.png
Vidrio/Assets.xcassets/AppIcon.appiconset/64.png
Vidrio/Assets.xcassets/AppIcon.appiconset/Contents.json
Vidrio/Assets.xcassets/Contents.json
```

The file `Vidrio/Assets.xcassets/AppIcon.appiconset/Contents.json` contains:

```json
{
  "images" : [
    {
      "size" : "16x16",
      "idiom" : "mac",
      "filename" : "16.png",
      "scale" : "1x"
    },
    {
      "size" : "16x16",
      "idiom" : "mac",
      "filename" : "32-1.png",
      "scale" : "2x"
    },
    {
      "size" : "32x32",
      "idiom" : "mac",
      "filename" : "32.png",
      "scale" : "1x"
    },
    {
      "size" : "32x32",
      "idiom" : "mac",
      "filename" : "64.png",
      "scale" : "2x"
    },
    {
      "size" : "128x128",
      "idiom" : "mac",
      "filename" : "128.png",
      "scale" : "1x"
    },
    {
      "size" : "128x128",
      "idiom" : "mac",
      "filename" : "256-1.png",
      "scale" : "2x"
    },
    {
      "size" : "256x256",
      "idiom" : "mac",
      "filename" : "256.png",
      "scale" : "1x"
    },
    {
      "size" : "256x256",
      "idiom" : "mac",
      "filename" : "512-1.png",
      "scale" : "2x"
    },
    {
      "idiom" : "mac",
      "size" : "512x512",
      "scale" : "1x"
    },
    {
      "size" : "512x512",
      "idiom" : "mac",
      "filename" : "1024.png",
      "scale" : "2x"
    }
  ],
  "info" : {
    "version" : 1,
    "author" : "xcode"
  }
}
```

Each object here has a `size` and `scale`. This determines the expected resolution of the referenced file. Here's the problematic object:

```json
    {
      "size" : "256x256",
      "idiom" : "mac",
      "filename" : "512-1.png",
      "scale" : "2x"
    }
```

The `size` of `256x256` with `scale` of `2x` means the file at `512-1.png` should be 512px by 512px. Here's my error.

It's pretty impossible to edit these things in XCode. I've fixed the error by:

* creating `png` files whose names correspond to their resolution, e.g. `512.png` has resolution 512px by 512px.
* fixing the `Contents.json` to point to the right file.
