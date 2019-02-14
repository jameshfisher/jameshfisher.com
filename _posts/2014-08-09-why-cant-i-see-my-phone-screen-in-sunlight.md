---
title: "Why can't I see my phone screen in sunlight?"
tags: []
---

We start out by defining what we mean by the "contrast". 
In subjective terms, I mean [my ability to distinguish between two things](http://en.wikipedia.org/wiki/Contrast_%28vision%29). 
My eyes distinguish "white" from "black" based on a difference in number of photons received per second. 
(Ignore color for simplicity.) 
That difference is relative, not absolute -- 
the contrast between 1 photon/second and 1000 photons/second 
is much larger than the contrast between 900001 photons/second and 901000 photons/second. 
The difference between 1 and 1000 is perceptible; 
the difference between 900001 and 901000 is not. 
The important thing is the *ratio*. 
This measurement has a name, "[contrast ratio](http://en.wikipedia.org/wiki/Contrast_ratio)".

Manufacturers assign contrast ratio ratings to their displays. 
A typical rating for a display is 1000:1. 
This means that, *[in a totally dark room](http://en.wikipedia.org/wiki/Contrast_ratio#Contrast_ratio_in_a_real_room)*, 
the white pixels on their display will emit 1000 times more photons than the black pixels. 
What about a book in a totally dark room? 
Well, there ain't no light to distinguish the white paper from the black ink, 
so for our purposes, the contrast ratio is 1:1. 
In a totally dark room, the display wins out.

Now what happens when we take these out in the sun? 
Let's deal with the book first. 
The important difference between white paper and black ink is that they reflect different amounts of light. 
I'll spare you from Googling "measuring blackness" and finding scary historical cultural anthropological stuff. 
The way that these surfaces are measured is their [Light Reflectance Value](http://en.wikipedia.org/wiki/Light_Reflectance_Value), 
which is the percentage of light that it reflects. 
[This paper](http://www.xerox.com/downloads/usa/en/t/ThreeKeyPaperPropertiesWhitePaper.pdf) 
suggests that white paper is around 90% 
(and, fascinatingly, paper can be *more than 100%* 
if [optical brighteners](http://en.wikipedia.org/wiki/Optical_brightener) are added). 
[This book](http://books.google.co.uk/books?id=g82nsBwbAs0C&pg=PA290) 
says that "good quality printer's ink" is about 15%. 
This means that the contrast ratio of the book is 90/15 = 6:1. 
Notice that this contrast ratio will be the same under any amount of light, 
unless you're in a *totally dark room*, 
in which case it loses its contrast entirely.

Now let's deal with the display. 
When the display is in the sun, 
it's still emitting light just like it was before. 
Only now it's *also* reflecting the light from the sun. 
The word on the street seems to be that 
that white pixel reflects just as much light as the black pixel does -- 
that is, they have a constant Light Reflectance Value. 
This means every pixel on the screen is also emitting a constant extra amount of light. 
The more that extra amount is, 
the worse the contrast ratio will be, 
just like the 1000:1 vs 901000:90001 in my example.

To work out what that contrast ratio will be, 
we need to drop down from simple ratios into the world of absolute values. 
We need to know how many photons/second the white pixel emits, 
how many the black pixel emits, 
and how many photons/second are reflected per pixel.

This (visible) photons/second thing is known as *luminance*, 
which is measured in *nits* (what?), 
or candelas per square metre. 
Manufacturers express the luminance of their displays as the luminance of a white pixel. 
[Apparently](http://en.wikipedia.org/wiki/Nit_%28unit%29), 
"Most consumer desktop liquid crystal displays have luminances of 200 to 300" nits. 
So let's say that white pixel is 300 nits. 
I think we can apply the 1000:1 contrast ratio to say that the black pixel is 0.3 nits.

Now we just need how many photons/second are *reflected* per pixel. 
Since the reflected pixels don't vary depending on the emitted pixels, 
we can measure this when the display is off. 
The number of pixels reflected obviously depends on how many are shone on the screen -- 
in a totally dark room, it's 0, 
but in the sun, it's much higher. 
We can express the number of reflected photons 
as a function of the number of absorbed photons using that Light Reflectance Value. 
What is the Light Reflectance Value of a display when powered off? 
I couldn't find references, so I used my eye instead: 
my phone screen turned off looks roughly like a page of black ink, 
so I'll use the same measurement: 15%. 
This means that the pixels reflect 15% of all photons they absorb.

How many photons/second from land on a pixel? 
This obviously depends on how bright the sun is. 
Now, [Wikipedia says](http://en.wikipedia.org/wiki/Luminance) that 
"The sun has luminance of about 16000000000 candelas per square metre". 
But there are wildly varying measurements for the luminance of the sun. 
[This paper](http://www.scenic.org/storage/documents/EXCERPT_Measuring_Sign_Brightness.pdf) says it's 6500 nits, 
which is pretty different to 16000000000.

I also don't know whether the "square metre" here 
is a square meter of the *sun's* surface or the earth's surface (?!). 
Rather than a measure of luminance, 
we probably want a measure of *[illuminance](http://en.wikipedia.org/wiki/Illuminance)*. 
[Wikipedia says](http://en.wikipedia.org/wiki/Sunlight) that 
"bright sunlight provides an illuminance of approximately 98 000 lux (lumens per square meter)". 
But then we need to convert lumens to lux, 
and other people tell me that they measure different things. 
Damn. I will continue using the 6500 figure.

Now, if I were to use that more sensible figure, 
6500 nits, we get a contrast ratio of 6800 : 6500.3, or 1.04:1, 
which you can probably just about distinguish.

As well as explaining the low contrast, 
this also explains why your phone screen looks *dark* in sunlight, too, 
as almost as if it's turned off. 
You're seeing the Light Reflectance Value of the screen, 
which is like a black sheet of paper, 
compared to your surroundings. 
The actual emitted light is almost irrelevant.

Notice that I didn't talk about the iris 
and how your eye uses it to accommodate for varying light levels. 
Lots of people have mentioned it as an explanation for the low contrast of the screen in sunlight, 
but according to my theorizing above, the iris is not actually relevant.

[Originally posted on Reddit](https://www.reddit.com/r/askscience/comments/2d2ff6/why_do_phonelaptop_screens_have_such_low_contrast/).