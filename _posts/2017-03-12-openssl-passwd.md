---
title: "How do I hash a password with `openssl`?"
justification: "I'm learning SSL by working through the CLI tool commands."
---

Another command of `openssl` is `passwd`, which hashes passwords. Here's an example:

```
$ openssl passwd -salt 2y5i7sg24yui secretpassword
Warning: truncating password to 8 characters
2yCjE1Rb9Udf6
```

This hashes the password "secretpassword" with the given salt. The hash algorithm used is _crypt_, a weak algorithm considered obsolete. Flags can change the hash algorithm (e.g. `-1` uses MD5), but there are no password hashes (e.g. bcrypt) in this list. This seems pretty shit.

Notice "truncating password to 8 characters". This means that all passwords with the same eight character prefix will produce the same hash:

```
$ openssl passwd -salt 2y5i7sg24yui secretpasomethingelse
Warning: truncating password to 8 characters
2yCjE1Rb9Udf6
```

This is a behavior of the crypt algorithm. I can't find any good reason for it on the web. Again, it seems pretty shit.
