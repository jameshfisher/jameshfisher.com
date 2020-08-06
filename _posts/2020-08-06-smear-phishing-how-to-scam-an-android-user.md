---
title: "Smear phishing: a new Android vulnerability"
tags: ["security", "phishing", "sms", "fave"]
---

In this post
I show how you can trick Android into displaying an SMS as coming from any contact on a victim's phone.
The trick is convincing and easy, 
and the Android vulnerability is still unpatched.
I then show how I stumbled onto it, reported it, and how Google ignored it.
Have fun, whether you patch the vuln or exploit it!

Say I work at Twitter.
I have Jack Dorsey, Twitter CEO, saved to my phone's contacts.
I have a previous legit conversation with Jack.
Right now, you can send me message from Jack,
which will appear in that conversation history,
like this:

<video controls autoplay muted loop style="max-width: 10cm">
  <source src="{% link assets/2020-08-06/scam_1_noaudio.mp4 %}" type="video/mp4">
  Your browser does not support the video tag.
</video>

Ten seconds later, my phone rings, I answer, and it's Jack.
Blearily, I follow his instructions to click the link in my latest email.
An hour later, hundreds of Twitter's biggest accounts are hacked.

The recent incident at Twitter was traced to 
["a phone spear phishing attack"](https://blog.twitter.com/en_us/topics/company/2020/an-update-on-our-security-incident.html).
Though we don't know all the details,
we do know that phone spoofs can lead to massive breaches.
Or, if your alignment is chaotic evil,
you could send a message from your enemy to his boss,
or a fake "drunk text" to his ex.
Fake messages that are completely indistinguishable from genuine messages.
Sit back and watch the fallout.

How does this phishing technique work?
It exploits a bug in how Android treats the "Sender ID" of an SMS message.
An SMS message can have an alphanumeric "Sender ID",
rather than coming from a numeric telephone number.
For example, I have an SMS message from the Sender ID `Twitter`, 
containing a password reset code.
These Sender IDs are fairly unregulated:
you can sign up on any SMS gateway and choose an arbitrary Sender ID.
Here's an example using [ClickSend](http://clicksend.com/):

<img src="{% link assets/2020-08-06/clicksend.png %}" />

Sender ID on its own can be used for low-quality phishing.
You could send me a message from the Sender ID `JackDorsey`.
This might convince someone, but
the message would appear in a new conversation,
the sender would not show up as a contact,
and the message details would show that it is not from a real phone number.
My phishing alarm would ring loudly.

For a different approach, 
you could try sending me a message from the Sender ID `07890123456` --
Jack's number.
This would actually be the same as sending a message from Jack's number:
the only way SMS distinguishes real phone numbers from Sender IDs
is that Sender IDs have non-numeric characters in them!
Therefore, SMS gateways stop you using numeric Sender IDs,
precisely to avoid forgery.

But then you have a dumb idea:
what if you sent an SMS from `O7890123456` --
with a leading `O`, rather than `0`?
It's a valid Sender ID,
but surely no one would fall for a low-quality scam like that?

Imagine my surprise, dear reader,
when I tried this stupid trick,
and the message actually arrived from the _genuine_ Jack Dorsey contact on my phone.
As a new message in the legit conversation.
And which, when inspected, was indistinguishable from a genuine message:
it shows as from `+447890123456`.
Somewhere in the chain from the SMS gateway to my Android Messages app,
something was replacing the `O` with a `0`, and interpreting it as a genuine phone number!
Who could be so stupid, and how did this code get into production?

<img src="{% link assets/2020-08-06/message_details.png %}" style="max-width: 10cm; margin: 0 auto; display: block"/>

By elimination, I quickly found that Android is the culprit.
It wasn't the SMS gateway -- the same stupid trick works with other gateways.
It wasn't the phone's network provider, or country -- the same stupid trick works with another phone on another operator in France.
It wasn't the Messages app -- the same stupid trick works with all other SMS apps on Android.
But if I tried the trick with an iPhone, it wasn't fooled -- it came through just as the fake Sender ID.

On July 3rd, I reported this vulnerability to Google via [their security vuln program](https://www.google.com/appserve/security-bugs/m2/new).
But on July 17th, Google closed the issue as "Won't Fix (Infeasible)",
with the assessment that 
"there are no guarantees regarding the sender ID of SMS messages, and they are known to be spoofable."
While this isn't wrong,
it's another thing for the OS to completely misrepresent the Sender ID as a genuine phone number.
And clearly it's feasible to fix, because iOS does not have this vulnerability.

So it's up to you, internet hackers, to find and fix the vuln!
Here are some clues.
The bug, more precisely, is that Android extracts the numeric characters from the Sender ID,
and tries to parse this as a phone number (with the phone's local dialling prefix -- `+44` in my case).
If it parses, the message is interpreted as from that number.
For example, `7890X123456` also parses as `+447890123456`.
Then, if a contact on the phone has that number,
the message displays from that contact.
Android's SMS APIs are
[`android.telephony.SmsMessage`](https://developer.android.com/reference/android/telephony/SmsMessage#getDisplayOriginatingAddress())
and [the "SMS inbox" API](https://developer.android.com/reference/android/provider/Telephony.Sms.Inbox).
The latter API looks just awful,
so I imagine you'll find the bug somewhere in there.
If you find or fix the vulnerability,
I'll give you some fake internet points and mention you here.
I'm very curious _why_ Android has this behavior.

Or if you're just here to read,
check out my previous phishing scams:
[The Inception Bar](https://jameshfisher.com/2019/04/27/the-inception-bar-a-new-phishing-method/),
or how to scam a Chrome user;
and [The Dots Do Matter](https://jameshfisher.com/2018/04/07/the-dots-do-matter-how-to-scam-a-gmail-user/),
or how to scam a Gmail user.
Google must love me by now.

_Thanks Jonathan, Kevin and Alex for reviewing previous drafts of this post. Thanks Luka and others for helping test the vuln._