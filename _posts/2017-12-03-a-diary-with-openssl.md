---
title: "An encrypted diary using OpenSSL"
---

Writing helps me think.
Today, my main outlet for writing, and thus for thinking, is this blog.
But this blog is fully public and advertised.
Many of my thoughts I would like to keep private.
For this, the proper medium is not a blog; it is a _diary_.

A diary is extremely different to a blog,
but some requirements are similar.
The diary should have history.
The diary should be storable as plain files.
Entries should be timestamped.
The diary should be editable anywhere.
The diary should be useable with standard tools (e.g. editors, git).

I could implement this with a directory full of plaintext files,
with their history stored in git,
synchronized to a cloud service.
This is exactly how I keep my blog.
But how to implement privacy?

The clear answer is _encryption_.
Each diary entry, stored as a file, should be encrypted
so that only I can view the entries using a password.
Crypto comes in two forms: symmetric and asymmetric.
Symmetric would be simplest,
but asymmetric has a significant advantage:
it lets me write a diary entry without entering the decryption password.
This means I have to type less,
I can write secure entries on an untrusted computer,
and entries may be plausibly deniable in the event of a breach.

To use asymmetric crypto,
I generate a master keypair.
Diary entries will be encrypted with the public key.
The private key will be stored encrypted with my master password.
(An alternative design is to
[use the password as the source for the keypair]({% post_url 2017-03-24-your-password-is-the-private-key-so-what-is-the-public-key %}).)
To encrypt long diary entries,
public-key encryption is unsuitable,
so instead each entry will get a one-time shared secret,
used to encrypt the entry symmetrically.
There are many ways to achieve this;
one is to generate a random secret for the entry,
then encrypt the secret with the public key.
There are thus three levels of encryption in this scheme:
a diary entry is encrypted with a symmetric secret,
which is encrypted with an asymmetric private key,
which is encrypted with a master password.

The most common tool for asymmetric crypto is OpenSSL.
Let's make a diary using OpenSSL!
First we generate our master keypair,
encrypting the private key with our password.
Here I choose to use RSA for asymmetric crypto:

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 \
  | PASSWORD="${password}" openssl pkey -passout env:PASSWORD > "${priv_key_path}"
PASSWORD="${password}" < "${priv_key_path}" openssl pkey -passin env:PASSWORD -pubout > "${pub_key_path}"
```

Next, when we want to write a diary entry,
we write two files.
First, the file `secret`, which is a new shared secret, encrypted with the public key.
Next, the file `ciphertext`, which is the ciphertext encrypted with the shared secret.
Here I choose to use AES for symmetric crypto:

```bash
secret="$(openssl rand 32 | base64)"
<<< "${secret}" openssl pkeyutl -encrypt -pubin -inkey "${pub_key_path}" > "${entry_dir}/secret"
SECRET="${secret}" < /dev/stdin openssl enc -AES-256-CBC -pass env:SECRET > "${entry_dir}/ciphertext"
```

Finally, when we want to read an entry,
we decrypt the private key with the master password,
then decrypt the shared secret with the private key,
then decrypt the ciphertext with the shared secret:

```bash
secret="$( PASSWORD="${password}" < "${entry_dir}/secret" \
  openssl pkeyutl -decrypt -inkey "${priv_key_path}" -passin env:PASSWORD )"
SECRET="${secret}" < "${entry_dir}/ciphertext" \
  openssl enc -d -AES-256-CBC -pass env:SECRET
```

[I made this tool called `diary` in 50 lines of bash](https://github.com/jameshfisher/diary-openssl/blob/master/diary.sh),
which does the above,
and has the following interface:

```
diary init                 Initialize the database
diary write                Write a diary entry
diary read entry_dir...    Read the specified entries
```

Now, OpenSSL is probably not the best tool for the job.
I had to make quite a few low-level crypto decisions.
In particular, it's ugly to manually generate shared secrets
and to store them in separate files.
Later I'll look at GPG, which should do a lot of this work for me.
