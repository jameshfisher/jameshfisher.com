---
title: The sorry state of OpenSSL usability
tags:
  - programming
  - rant
  - openssl
  - fave
hnUrl: 'https://news.ycombinator.com/item?id=16024515'
hnUpvotes: 78
---

OpenSSL is one of the most used and important pieces of software in the world.
Much time and much money is poured into fixing its occasional horrifying vulnerabilities.
But almost no effort goes into improving its usability.
This begins with:

```
$ openssl --help
openssl:Error: '--help' is an invalid command.
$ man openssl
No manual entry for openssl
```

I'm on MacOS, where there is no `--help` text and no `man` page.
So, to figure out how to use OpenSSL, you have to go to Google.
Say you want to generate an RSA key,
so you Google it,
and find a couple of official-looking pages,
<https://www.openssl.org/docs/manmaster/man1/genrsa.html>
and <https://wiki.openssl.org/index.php/Manual:Genrsa(1)>.
Every OpenSSL command has two documentation pages,
one under "docs" and one on their wiki.
They're usually very similar but subtly different:
make sure to consult both!

Anyway, both pages informatively say
"genrsa - generate an RSA private key.
The genrsa command generates an RSA private key."
There are no examples of use,
but forget about that,
because there are much bigger problems.
Firstly,
you're on MacOS,
where OpenSSL _is not OpenSSL at all_!

```
$ openssl version
LibreSSL 2.2.7
```

Instead, your `openssl` is actually "LibreSSL",
one of the many forks of the OpenSSL project.
So you're not looking at the right documentation at all;
you should be looking on the LibreSSL website!
Unfortunately, <http://www.libressl.org/> won't help you either,
because _there literally isn't any documentation of LibreSSL_.
Instead, you just have to read the OpenSSL docs,
and just hope the behavior is roughly the same.

But let's say you worked out how to generate your private key:

```
$ openssl genrsa -out private_key.pem
Generating RSA private key, 512 bit long modulus
.............++++++++++++
..............++++++++++++
e is 65537 (0x10001)
```

OpenSSL decided to use a "512 bit long modulus", the default.
We're told: "don't roll your own crypto;
instead trust standard tools like OpenSSL".
The modulus length is a good example of why:
a wrong value results in a trivially breakable key,
and you the user shouldn't need to know what the right value is.
So OpenSSL chooses a sensible modulus length for you.

Wait, no, it doesn't.
It turns out that "512 bit long modulus" is
cryptographer-speak for "you may as well just send cleartext."
In 2015, cracking a 512-bit RSA key cost "$75 and four hours".
Ars Technica describe this in their article,
["Breaking 512-bit RSA with Amazon EC2 is a cinch. So why all the weak keys?"](https://arstechnica.com/information-technology/2015/10/breaking-512-bit-rsa-with-amazon-ec2-is-a-cinch-so-why-all-the-weak-keys/),
yet they fail to give the blindly, blisteringly obvious answer to their question:
all the keys are weak because _weak keys are the default in OpenSSL,
and you'd never know otherwise from any output or documentation._
You just need to know!

By the way, you saw that I saved the key to a `.pem` file.
How did I know to use that?
Not from the documentation; that won't help you.
You just need to look at the output, and notice that it "looks like a PEM":

```
$ cat private_key.pem
-----BEGIN RSA PRIVATE KEY-----
MIIBPAIBAAJBAMlkvvGKpGDsOj9Uji5oirxvpxlsHxIZ2CXWk+kHZG4Vnxx/B9hz
7GUdRrR/BsNgefOgOQKym3eUvQWRX2WZz48CAwEAAQJBAMRg4bQkDe+YyZ9xcwcb
15Sxhw5KGO4Ml3EmEKqdE7gmz7gR1CjzXDLBqhw+GjH1eStn8u2IDDm9BE1HA3wl
WIECIQDv3/wtFtakiiGrsiPuyKMb3CsswAokouxNhKjA/0PlTwIhANbuiICB2YJu
DLgtR1i7OABF2X/qBMIWVqZmXS9KSWHBAiBF/yJjNerkkLpKk+0QXNPb6V9f65oK
HtC9vhxQVSzG2QIhALPd6RQKFrnFWRWkpsmF2+a2jb8zW4oFYbxde+xAccrBAiEA
k+lP7EEAkqwSjQ9XuYAaSICmp2e+EFuWaqMSfmQEI84=
-----END RSA PRIVATE KEY-----
```

Does this look like a PEM to you?
Only if you've seen one before.
Imagine guessing whether an image file was PNG or JPEG by analyzing the output.
But anyway, the file isn't really in "PEM format".
There are at least three formats for RSA private keys,
colloquially called "SSLeay", "PKCS#1", and "PKCS#8".
You'll often get stuck,
because different commands use different incompatible formats.
Let's say you need to use your key on a Java server, for which you need a PKCS#8 file.
Can you use the above file?
Try to find out what format it's in!

Did you figure it out?
Your key is in the PKCS#1 format.
It's quite obvious;
you just need to [read RFC 3447 which describes the PKCS#1 structure](https://tools.ietf.org/html/rfc3447#appendix-A.1.2),
then run `openssl asn1parse -in private_key.pem`,
and see that the hidden ASN.1 structure in the file consists of a sequence of nine integers.
Bad luck: you can't use this key with Java, or a bunch of other systems.

It turns out that the modern format for private keys is PKCS#8, not SSLeay or PKCS#1.
But you're never told this in the OpenSSL documentation or in any output.
When you use a file in the deprecated SSLeay format, the tool could tell you,
"Note: you're using a private key in the SSLeay format;
you should convert it to PKCS#8 with: `openssl pkcs8 -topk8 -in private_key.pem -out private_key.p8`".
But it doesn't tell you this.
You just need to know!

You went wrong as soon as you clicked on the documentation for `openssl genrsa`,
because you _should_ have clicked on the documentation for `openssl genpkey`,
which has superseded `genrsa`.
But there's no clue to this in the documentation;
no banner saying "this command is deprecated".
There's no clue in the output of `openssl genrsa`;
no warning to "consider using `openssl genpkey` instead".
So people will be using the deprecated `genrsa` interface for many happy years to come.

These examples scratch the surface of OpenSSL's usability.
All of these problems are fixable,
but this will require an attitude shift from OpenSSL developers.
Users matter: try doing some usability testing.
Try adding some help text and `man` pages,
instead of hijacking the wiki webpage of a different SSL project.
And stop forking OpenSSL; you're just making things worse.
