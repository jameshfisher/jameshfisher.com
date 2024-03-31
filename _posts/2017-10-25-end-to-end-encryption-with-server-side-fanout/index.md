---
title: Group chat with end-to-end encryption
tags:
  - programming
  - crypto
summary: >-
  Group chat with end-to-end encryption can use "client-side fan-out" where the
  sender encrypts the message separately for each recipient, or "server-side
  fan-out" where the sender encrypts the message once using a shared secret,
  then the server distributes the ciphertext to the group.
---

In a two-person conversation,
end-to-end encryption works
by standard asymmetric crypto.
Alice and Bob each generate their own keypairs,
then they exchange public keys,
then Bob sends each message encrypted with Alice's public key.
How does this two-person encryption scheme extend to multi-person group chat?
In a group chat, when Bob sends a message,
whose public key does he encrypt the message with?

One scheme is for Bob to encrypt the message with every participant's key in turn.
In a group chat with 30 other participants,
Bob sends the message 30 times,
encrypting each message for the one intended reader.
In effect, this approach represents a group chat
using lots of two-person private chats.

The above scheme can be called "client-side fan-out".
An advantage of client-side fan-out is that
it re-uses the same protocol used for two-person conversations.
But one disadvantage is that
the fan-out can use a lot of the client's network bandwidth.
This cost can be prohibitive if the group is big or the network bandwidth is small.

Can we provide server-side fan-out, and still keep end-to-end encryption?
The sender will need to encrypt a single message
with a key which all the group members possess.
This is possible with a shared secret and symmetric encryption.
The sender encrypts the message once with the shared secret,
and sends the ciphertext to the server.
The server does fan-out on the ciphertext, but can't read the message.
Each recipient can decrypt the message with the shared secret.

This requires a mechanism to distribute the group shared secret.
For this, we can fall back on the "client-side fan-out" scheme!
Someone decides on the group's shared secret,
then sends the secret to each member
by encrypting it with that member's public key.

Who decides on the group's shared secret?
Because no one except the group members can know the secret,
the secret must be decided by a group member.
A natural option is for the group creator to decide on the secret.
