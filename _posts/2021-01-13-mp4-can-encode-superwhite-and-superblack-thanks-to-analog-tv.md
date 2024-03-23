---
title: 'MP4 can encode superwhite and superblack, thanks to analog TV'
tags:
  - video
hnUrl: 'https://news.ycombinator.com/item?id=25776560'
hnUpvotes: 2
---

I was making a video with Premiere Pro.
It was supposed to be a screen recording, with a semi-transparent watermark on top of it.
Only, when I set the watermark opacity to ~20% or lower, it didn't appear at all!
Or rather, where the screen recording was white, the watermark didn't appear at all.
It was as if the screen recording was _even whiter_ than ordinary white,
burning through the watermark.

Testing the watermark on top of other other videos, it worked just fine.
I made a white reference video from a white image, and the overlay worked just fine.
It was just this damned screen recording - how was it _so_ white?

Closely watching back the screen recording, it didn't look quite right.
It was as if a "high contrast" filter had been applied.
Light greys from the original screen became white, and dark greys became black.
This happened in any video players (e.g. VLC, or Chrome).
So the screen recorder (Windows Game Bar 🤔) had done a bad job,
but in doing so, had somehow managed to encode _super-white_ and _super-black_ colors
that burned through my watermark!
How?

The `ffprobe` tool shows video file metadata;
here's what it says about my mysterious recording:

```shell
$ ffprobe screen_recording.mp4
...
    Stream #0:0(und): Video: h264 (Main) (avc1 / 0x31637661), yuv420p(tv), 2560x1416 [SAR 1:1 DAR 320:177], 18207 kb/s, 30.10 fps, 59.94 tbr, 30k tbn, 59.94 tbc (default)
```

The important thing here is `yuv420p(tv)`.
This is the "pixel format" that the file metadata claims the data is using.
The `yuv` part means it's using [the YUV color space](https://en.wikipedia.org/wiki/YUV).
The `420p` part means it's using [4:2:0 chroma subsampling](https://en.wikipedia.org/wiki/Chroma_subsampling#4:2:0).
But the most important part is the `(tv)` bit.
This means it encodes the Y component in the range `16..235`, instead of the normal `0..255` range of a single byte.

Wait ... what the fuck?
Yes, you read that right: 
black is encoded as the value `16`, 
and white is encoded as the value `235`.
But why would anyone do that?
The justification seems lost to history.
But it dates back at least to 1982, when [BT.601 defined a method for encoding analog TV video in digital form](https://en.wikipedia.org/wiki/Rec._601).
Alas, that document does not justify the strange `16..235` range,
so presumably it dates even further back to analog TV standards.

More importantly,
the fact that black-to-white is squashed into the range `16..235`
means that the values `0..15` and `236..255` are ... open to interpretation.
The most obvious interpretation is that `0..16` are "even blacker than standard black",
and `236..255` are "even whiter than standard white",
similar to a [high-dynamic-range video](https://en.wikipedia.org/wiki/High-dynamic-range_video),
but unintentional.

This would explain my mysterious screen recording:
perhaps it encodes its luminance values using the sensible `0..255` system,
but for some reason advertises itself as using the `16..235` "TV" range.

To test, we can get `ffmpeg` to scale the color range
from the `jpeg` range (another name for `0..255`)
to the `mpeg` range (another name for `16..235`):

```bash
ffmpeg -i screen_recording.mp4 -vf scale=in_range=jpeg:out_range=mpeg screen_recording_reencoded.mp4
```

And hey presto, this video looks perfect! Just like the original screen!

The above reencodes the whole video, but another option should be to change the metadata
to specify that the video is encoded with `0..255` range.
In theory, the following command does this;
but sadly it seems to keep the metadata the same:

```shell
$ ffmpeg -i screen_recording.mp4 -pix_fmt yuv420p -c copy -color_range 2 -pix_fmt yuv420p screen_recording_metadata_changed.mp4
...
$ ffprobe screen_recording_metadata_changed.mp4
...                                                                  !!!! 
    Stream #0:0(und): Video: h264 (Main) (avc1 / 0x31637661), yuv420p(tv), 2560x1416 [SAR 1:1 DAR 320:177], 18223 kb/s, 30.13 fps, 59.94 tbr, 30k tbn, 59.94 tbc (default)
```
