---
title: Product key server as a service
justification: I'm making Vidrio. I want something to manage Vidrio licensing/keys.
tags: []
summary: >-
  I want a service to manage product keys for software monetization, including key
  generation, signing, distribution, and verification, with optional machine or
  user licensing restrictions.
---

Here is the service that I want:

1. Developer makes app FooBar, and wants to monetize it via product keys.
2. Developer signs up for a PKSaaS.com account, a product-key-server-as-a-service company.
3. PKSaaS generates an asymmetric keypair for developer's account. PKSaaS will use this to sign product key files.
4. Developer downloads the PKSaaS.com library and integrates it into app FooBar.
   Developer provides the library with the public key.
   The PKSaaS library registers the app to handle `*.foobar-key` files.
   The library handles opening `*.foobar-key` files,
   verifying the authenticity of the product key file with the public key,
   and storing the product key file locally.
5. Developer adds "buy product key" section to FooBar.com. This payment page is provided by PKSaaS.com.
6. When PKSaaS.com receives payment from a FooBar customer jim@jam.com, it generates a key for `jim@jam.com`, signs this with the private key, and emails this to jim@jam.com as the attached file `jim@jam.com.foobar-key`.
7. Jim opens the attachment, which automatically opens in FooBar.
8. The PKSaaS library verifies the `jim@jam.com.foobar-key` file's signature, saves the file, then informs the FooBar application logic that it should allow paid features.
9. Periodically or on demand, the PKSaaS library checks that the product key file is still valid (e.g., has not expired).

Optionally, there may be logic which ties the product key to the machine, or limits the number of machines using that product key, or verifies that the current user really is `jim@jam.com`. These would be designed to prevent the dispersal/reselling of the `jim@jam.com.foobar-key` product key.

My problem is that I can only find a single service which does this: [FastSpring](https://fastspring.com). Where are the competitors?
