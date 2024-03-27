---
title: How to create an SSH certificate authority
tags:
  - posix
hnUrl: 'https://news.ycombinator.com/item?id=17720316'
hnUpvotes: 1
summary: >-
  Creating and using an SSH certificate authority, an alternative to the default "trust on first use" model.
---

SSH uses asymmetric crypto.
Each server and each client has its own keypair.
When an SSH client opens an SSH connection to an SSH server,
there are a couple of trust issues to resolve.
The server needs to know whether this is truly an authorized client,
and the client needs to know whether the server is truly the server it claims to be.
All organizations using SSH need to solve these trust and authentication issues.
First I'll show how most organizations solve these issues,
then I'll show how to solve these issues using an SSH certificate authority.

Here's how most organizations use SSH.
There are a bunch of employees and a bunch of servers.
Each employee should be able to SSH to each server,
and no one else should be able to SSH to these servers.
This organization uses the standard SSH setup, where
the server trusts the client if the client's public key is in a preconfigured list of authorized employees' public keys,
and the client trusts the server's public key the first time it sees it.

Let's first see this example with one employee, `jim`, using his device `macbook-2017`,
and one server, `cloud.jameshfisher.com`.
Each employee  generates their SSH keypair like this:

```console
jim@laptop:~$ ssh-keygen -t ed25519 -N '' -C jim@macbook-2017 -f ~/.ssh/id_ed25519
Generating public/private ed25519 key pair.
Your identification has been saved in /Users/jim/.ssh/id_ed25519.
Your public key has been saved in /Users/jim/.ssh/id_ed25519.pub.
The key fingerprint is:
SHA256:NyVqDVysRM0iNBlpLs9iQqaSPS8DJnoBAlrFgfSEEPQ jim@macbook-2017
The key's randomart image is:
+--[ED25519 256]--+
|+=.=+o+=.+.      |
|. =o. =oo.+      |
|o. E.o ooo. .    |
|+ o . . .+ o     |
|.B   +  S +      |
|*.= o o. . .     |
|=. * .           |
|. + .            |
| . o             |
+----[SHA256]-----+
jim@laptop:~$ cat ~/.ssh/id_ed25519.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIG98Y8egOBwfMdR5Wv7Wam/Y4ww5nzukBHBGDx/vnJvm jim@macbook-2017
```

(Above the employee Jim uses a ED25519 keypair instead of the default RSA.
This is to demonstrate, in a minute, that we can mix and match key types.)
Similarly, each server generates its own SSH keypair when SSH is installed.
Actually each client can server can have many keys,
and for the server these can be seen under `/etc/ssh/ssh_host*`, e.g.:

```console
root@cloud:~$ cat /etc/ssh/ssh_host_ecdsa_key.pub
ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBJBa4c8wVzMp+ed6nLQAmUKXZ8ENXc6NpEzfTY2sjMqYJlWYktAeihlLOf5QnatkYsXnsP7Pu+yd2xF9M8dY4u0= root@cloud
```

You can also see these keys publicly using:

```console
you@anywhere:~$ ssh-keyscan cloud.jameshfisher.com | grep ecdsa
cloud.jameshfisher.com ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBJBa4c8wVzMp+ed6nLQAmUKXZ8ENXc6NpEzfTY2sjMqYJlWYktAeihlLOf5QnatkYsXnsP7Pu+yd2xF9M8dY4u0=
```

The organization has a central store of employees' public keys,
and these get synchronized to every server under `${USER}/.ssh/authorized_keys`
(via some external mechanism like Puppet).
The file `~jim/.ssh/authorized_keys` contains the public keys which are allowed to access the account `jim`.
In our case we have:

```console
jim@cloud:~$ cat ~/.ssh/authorized_keys
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIG98Y8egOBwfMdR5Wv7Wam/Y4ww5nzukBHBGDx/vnJvm jim@macbook-2017
```

Once the server `cloud.jameshfisher.com` has Jim's public key,
Jim can SSH to the machine like this:

```console
jim@laptop:~$ ssh -i ~/.ssh/id_ed25519 cloud.jameshfisher.com
The authenticity of host 'cloud.jameshfisher.com (35.190.176.201)' can't be established.
ECDSA key fingerprint is SHA256:vm5X6LZPUv7ZTy2oliLO9qKJy5svHvBHElL1YfouKWc.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added 'cloud.jameshfisher.com,35.190.176.201' (ECDSA) to the list of known hosts.
Welcome to Ubuntu 16.04.3 LTS (GNU/Linux 4.13.0-1011-gcp x86_64)
```

When Jim first SSHes to `cloud.jameshfisher.com`,
his local SSH asks Jim whether the server's key (with some ECDSA key fingerprint)
is genuinely a key owned by `cloud.jameshfisher.com`.
Jim says `yes`.
Everyone always does.
Then his local SSH adds this key to a list of `known_hosts`:

```console
jim@laptop:~$ cat ~/.ssh/known_hosts | grep cloud.jameshfisher.com
cloud.jameshfisher.com,35.190.176.201 ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBJBa4c8wVzMp+ed6nLQAmUKXZ8ENXc6NpEzfTY2sjMqYJlWYktAeihlLOf5QnatkYsXnsP7Pu+yd2xF9M8dY4u0=
```

In future, if Jim tries to SSH to `cloud.jameshfisher.com`,
his local SSH client will demand that the server has the key in `known_hosts`.
This policy used by Jim and his local SSH is called "trust on first use", or "TOFU".

TOFU has the weakness that a man-in-the-middle attack can be performed
each time an employee tries to SSH to a machine for the first time.
With more employees and more servers, the opportunities for a man-in-the-middle attack grow quadratically.
Despite this weakness, TOFU is used by SSH clients by default, and thus by most organizations.

One way to avoid TOFU would be to sychronize a list of server public keys to each employee's `known_hosts`,
and configure SSH to disable TOFU.
This is essentially the same as the process used to authenticate users on the server.
However, I haven't been in any organizations which do this, so I assume it's not common.

With this default SSH setup,
the `authorized_keys` and `known_hosts` files grow large.
A way to avoid this is to change the authentication mechanism to instead use a "certificate authority".
Under this model,
the server and client keep their current keypairs,
but each additionally has a "certificate" file which signs their public key.
Instead of trusting an `authorized_keys` file,
the server's SSH can be told to trust a certificate presented by the client.
Instead of trusting a `known_hosts` file,
the employee's SSH can be told to trust a certificate presented by the server.
This way, instead of the server keeping a list of many `authorized_keys`,
and instead of the client keeping a list of many `known_hosts`,
each keeps only the single public key of the certificate authority it trusts.

The certificate authority is an SSH key pair,
just like client and host key pairs.
We generate the certificate authority in the same way, using `ssh-keygen`:

```console
root@ca:~/sshca$ ssh-keygen -t rsa -N '' -C 'ca@jameshfisher.com' -f ca
Generating public/private rsa key pair.
Your identification has been saved in ca.
Your public key has been saved in ca.pub.
The key fingerprint is:
e4:1c:e1:b1:98:a6:d0:29:7b:64:88:32:b3:15:e0:54 ca@jameshfisher.com
The key's randomart image is:
+--[ RSA 2048]----+
|.ooE    o        |
|o. + . + +       |
|=.= = + =        |
|.= * o + .       |
|. . o   S        |
|   .             |
|                 |
|                 |
|                 |
+-----------------+
root@ca:~/sshca:~/sshca$ cat ca.pub
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDuJ6JYUwPqgdKt9LSE1QJ3w1fwlULzi4qnqyhdF06P9mBYXlAEM7wlHx6hthc8U9VrLOoC6MDrJnNHiJafEkb8BpUMzMRgywU+Pz5azGkM7MVPhIXuIVDkNjEK9sHAS/oQrqLh9AO+3v8nFVCUzFKpe2IgRLHqjRIk3aiL1HQDgezDgEpBQHBpEFv7lblSb92lLnAnjDNtzTFhi3QkFzGJG8CSw3HAJD+4FEOqff9PBn5zUK+2BwEUGxJW7uelslAKHKWEN6/4aWsQJdgkTHfY3YoHUTiVpso4tXi9lnexrc+vjioHiIxE2+2LL08Mm8LjfJd+P01wCS56z4R5wMet ca@jameshfisher.com
```

The CA machine,
because it has the CA private key,
can create certificates for Jim and for the server `cloud.jameshfisher.com`.
Jim's certificate is a "client certificate",
and the server's is a "host certificate".

Let's first create a host certificate for `cloud.jameshfisher.com`:

```console
root@ca:~/sshca$ cat <<EOF > cloud.jameshfisher.com.pub
> ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBJBa4c8wVzMp+ed6nLQAmUKXZ8ENXc6NpEzfTY2sjMqYJlWYktAeihlLOf5QnatkYsXnsP7Pu+yd2xF9M8dY4u0= root@cloud
> EOF
root@ca:~/sshca$ ssh-keygen -s ca -h -I cloud.jameshfisher.com cloud.jameshfisher.com.pub
Signed host key cloud.jameshfisher.com-cert.pub: id "cloud.jameshfisher.com" serial 0 valid forever
root@ca:~/sshca$ cat cloud.jameshfisher.com-cert.pub
ecdsa-sha2-nistp256-cert-v01@openssh.com AAAAKGVjZHNhLXNoYTItbmlzdHAyNTYtY2VydC12MDFAb3BlbnNzaC5jb20AAAAgV5EMZz9hqYOV+EpxrAeqtGgF/T2E1dXjqnSh/ZW9ESkAAAAIbmlzdHAyNTYAAABBBJBa4c8wVzMp+ed6nLQAmUKXZ8ENXc6NpEzfTY2sjMqYJlWYktAeihlLOf5QnatkYsXnsP7Pu+yd2xF9M8dY4u0AAAAAAAAAAAAAAAIAAAAZcGVyc29uYWwuamFtZXNoZmlzaGVyLmNvbQAAAAAAAAAAAAAAAP//////////AAAAAAAAAAAAAAAAAAABFwAAAAdzc2gtcnNhAAAAAwEAAQAAAQEA7ieiWFMD6oHSrfS0hNUCd8NX8JVC84uKp6soXRdOj/ZgWF5QBDO8JR8eobYXPFPVayzqAujA6yZzR4iWnxJG/AaVDMzEYMsFPj8+WsxpDOzFT4SF7iFQ5DYxCvbBwEv6EK6i4fQDvt7/JxVQlMxSqXtiIESx6o0SJN2oi9R0A4Hsw4BKQUBwaRBb+5W5Um/dpS5wJ4wzbc0xYYt0JBcxiRvAksNxwCQ/uBRDqn3/TwZ+c1CvtgcBFBsSVu7npbJQChylhDev+GlrECXYJEx32N2KB1E4labKOLV4vZZ3sa3Pr44qB4iMRNvtiy9PDJvC43yXfj9NcAkues+EecDHrQAAAQ8AAAAHc3NoLXJzYQAAAQC3YPAfsDu7e7ax7BGa1u954xYF3AAt4uGpSo+sXKOJOQCoEzunR7PS0q3YI2FEvuTQ2lZIEvgvFI2WmhEaGVbINa0899mSbhLYS9LzBkXTHZka6zyqLP7YfnZOt9xG64Kn4yyjRmNYRiiR3fDmzNCadHdV4YPgJXX5AmKxT5UM9EcQL2ExaldIlOY/swqz1onSqBWtjxDgNY2mcz/wWt1io12a9OhNxju0IiuEiZzp3guUUvyY5kMmWl/WEg41Q1f0mBUS5WDA1uB0/ekpuKCoAAL3/GiXsVrn1b9W1UDVdX4+YPFutLMnTTLhVLH2JvbI1S89a03DeNQCpUXtusSC  root@cloud
```

Notice that certificates are created with the same `ssh-keygen` command,
even though we're generating a certificate, not a keypair.
But the certificate embeds a public key,
and we can see this by inspecting the certificate with `ssh-keygen -L`:

```console
root@ca:~/sshca$ ssh-keygen -L -f cloud.jameshfisher.com-cert.pub
cloud.jameshfisher.com-cert.pub:
        Type: ecdsa-sha2-nistp256-cert-v01@openssh.com host certificate
        Public key: ECDSA-CERT 70:7f:5c:00:fb:d2:05:b1:88:8f:26:a7:69:91:ee:74
        Signing CA: RSA e4:1c:e1:b1:98:a6:d0:29:7b:64:88:32:b3:15:e0:54
        Key ID: "cloud.jameshfisher.com"
        Serial: 0
        Valid: forever
        Principals: (none)
        Critical Options: (none)
        Extensions: (none)
```

(Note the `Principals: (none)`.
For a host certificate, a principal is a domain which the certificate is valid for.
If the list is empty, many SSH clients will treat this as "valid for all domains".
This is not great practice.
To set the principals, use `-n cloud.jameshfisher.com`.)

Next, we copy the certificate to the server `cloud.jameshfisher.com`,
so that the server can serve this certificate to SSH clients, proving its authenticity.

```console
root@cloud:~$ cat <<EOF > /etc/ssh/ssh_host_ecdsa_key-cert.pub
ecdsa-sha2-nistp256-cert-v01@openssh.com AAAAKGVjZHNhLXNoYTItbmlzdHAyNTYtY2VydC12MDFAb3BlbnNzaC5jb20AAAAgV5EMZz9hqYOV+EpxrAeqtGgF/T2E1dXjqnSh/ZW9ESkAAAAIbmlzdHAyNTYAAABBBJBa4c8wVzMp+ed6nLQAmUKXZ8ENXc6NpEzfTY2sjMqYJlWYktAeihlLOf5QnatkYsXnsP7Pu+yd2xF9M8dY4u0AAAAAAAAAAAAAAAIAAAAZcGVyc29uYWwuamFtZXNoZmlzaGVyLmNvbQAAAAAAAAAAAAAAAP//////////AAAAAAAAAAAAAAAAAAABFwAAAAdzc2gtcnNhAAAAAwEAAQAAAQEA7ieiWFMD6oHSrfS0hNUCd8NX8JVC84uKp6soXRdOj/ZgWF5QBDO8JR8eobYXPFPVayzqAujA6yZzR4iWnxJG/AaVDMzEYMsFPj8+WsxpDOzFT4SF7iFQ5DYxCvbBwEv6EK6i4fQDvt7/JxVQlMxSqXtiIESx6o0SJN2oi9R0A4Hsw4BKQUBwaRBb+5W5Um/dpS5wJ4wzbc0xYYt0JBcxiRvAksNxwCQ/uBRDqn3/TwZ+c1CvtgcBFBsSVu7npbJQChylhDev+GlrECXYJEx32N2KB1E4labKOLV4vZZ3sa3Pr44qB4iMRNvtiy9PDJvC43yXfj9NcAkues+EecDHrQAAAQ8AAAAHc3NoLXJzYQAAAQC3YPAfsDu7e7ax7BGa1u954xYF3AAt4uGpSo+sXKOJOQCoEzunR7PS0q3YI2FEvuTQ2lZIEvgvFI2WmhEaGVbINa0899mSbhLYS9LzBkXTHZka6zyqLP7YfnZOt9xG64Kn4yyjRmNYRiiR3fDmzNCadHdV4YPgJXX5AmKxT5UM9EcQL2ExaldIlOY/swqz1onSqBWtjxDgNY2mcz/wWt1io12a9OhNxju0IiuEiZzp3guUUvyY5kMmWl/WEg41Q1f0mBUS5WDA1uB0/ekpuKCoAAL3/GiXsVrn1b9W1UDVdX4+YPFutLMnTTLhVLH2JvbI1S89a03DeNQCpUXtusSC  root@cloud
EOF
root@cloud:~$ echo "HostCertificate /etc/ssh/ssh_host_ecdsa_key-cert.pub" | sudo tee -a /etc/ssh/sshd_config
root@cloud:~$ sudo service ssh restart
```

Let's try SSHing as Jim:

```console
jim@laptop:~$ ssh -v -i ~/.ssh/id_ed25519 cloud.jameshfisher.com
...
debug1: Server host certificate: ecdsa-sha2-nistp256-cert-v01@openssh.com SHA256:vm5X6LZPUv7ZTy2oliLO9qKJy5svHvBHElL1YfouKWc, serial 0 ID "cloud.jameshfisher.com" CA ssh-rsa SHA256:j47BobxYFq8pYzMBGyZCUcUScdU9qnP0/3XposwUH1g valid forever
debug1: No matching CA found. Retry with plain key
The authenticity of host 'cloud.jameshfisher.com (35.190.176.201)' can't be established.
ECDSA key fingerprint is SHA256:vm5X6LZPUv7ZTy2oliLO9qKJy5svHvBHElL1YfouKWc.
Are you sure you want to continue connecting (yes/no)?
```

Hmm, the server offered its host certificate, but Jim's SSH did not accept it.
This is because we must tell Jim's client SSH to trust our new certificate authority.
We do that by adding the CA's public key to Jim's `known_hosts`,
but prefixed with `@cert-authority *.jameshfisher.com`:

```console
jim@laptop:~$ cat <<EOF > ~/.ssh/known_hosts
> @cert-authority *.jameshfisher.com ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDuJ6JYUwPqgdKt9LSE1QJ3w1fwlULzi4qnqyhdF06P9mBYXlAEM7wlHx6hthc8U9VrLOoC6MDrJnNHiJafEkb8BpUMzMRgywU+Pz5azGkM7MVPhIXuIVDkNjEK9sHAS/oQrqLh9AO+3v8nFVCUzFKpe2IgRLHqjRIk3aiL1HQDgezDgEpBQHBpEFv7lblSb92lLnAnjDNtzTFhi3QkFzGJG8CSw3HAJD+4FEOqff9PBn5zUK+2BwEUGxJW7uelslAKHKWEN6/4aWsQJdgkTHfY3YoHUTiVpso4tXi9lnexrc+vjioHiIxE2+2LL08Mm8LjfJd+P01wCS56z4R5wMet ca@jameshfisher.com
> EOF
```

Now when Jim SSHes, his client SSH recognizes the CA and validates the server certificate:

```console
jim@laptop:~$ ssh -v -i ~/.ssh/id_ed25519 cloud.jameshfisher.com
...
debug1: Server host certificate: ecdsa-sha2-nistp256-cert-v01@openssh.com SHA256:vm5X6LZPUv7ZTy2oliLO9qKJy5svHvBHElL1YfouKWc, serial 0 ID "cloud.jameshfisher.com" CA ssh-rsa SHA256:j47BobxYFq8pYzMBGyZCUcUScdU9qnP0/3XposwUH1g valid forever
debug1: Host 'cloud.jameshfisher.com' is known and matches the ECDSA-CERT host certificate.
debug1: Found CA key in /Users/jim/.ssh/known_hosts:1
...
jim@cloud:~$
```

This showed how to set up _host_ certificates:
how to generate a host certificate,
how to configure an SSH server to offer that certificate,
and how to tell an SSH client to trust a certificate authority.
Now let's see how to set up _client_ certificates:
how to generate a client certificate,
how to configure the SSH client to offer that certificate,
and how to tell the SSH server to trust the certificate authority.

To generate the client certificate,
we follow the same process using `ssh-keygen`,
but omit the `-h` flag:

```console
root@ca:~/sshca$ cat <<EOF > jim_id25519.pub
> ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIG98Y8egOBwfMdR5Wv7Wam/Y4ww5nzukBHBGDx/vnJvm jim@macbook-2017
> EOF
root@ca:~/sshca$ ssh-keygen -s ca -I jim@macbook-2017 -n jim jim_id25519.pub
Signed user key jim_id25519-cert.pub: id "jim@macbook-2017" serial 0 valid forever
root@ca:~/sshca$ cat jim_id25519-cert.pub
ssh-ed25519-cert-v01@openssh.com AAAAIHNzaC1lZDI1NTE5LWNlcnQtdjAxQG9wZW5zc2guY29tAAAAIK1eJnSCVKdC7E2+7P/5J2yaCmivgC5jpb6G4iTRdG6aAAAAIG98Y8egOBwfMdR5Wv7Wam/Y4ww5nzukBHBGDx/vnJvmAAAAAAAAAAAAAAABAAAAEGppbUBtYWNib29rLTIwMTcAAAAHAAAAA2ppbQAAAAAAAAAA//////////8AAAAAAAAAggAAABVwZXJtaXQtWDExLWZvcndhcmRpbmcAAAAAAAAAF3Blcm1pdC1hZ2VudC1mb3J3YXJkaW5nAAAAAAAAABZwZXJtaXQtcG9ydC1mb3J3YXJkaW5nAAAAAAAAAApwZXJtaXQtcHR5AAAAAAAAAA5wZXJtaXQtdXNlci1yYwAAAAAAAAAAAAABFwAAAAdzc2gtcnNhAAAAAwEAAQAAAQEA7ieiWFMD6oHSrfS0hNUCd8NX8JVC84uKp6soXRdOj/ZgWF5QBDO8JR8eobYXPFPVayzqAujA6yZzR4iWnxJG/AaVDMzEYMsFPj8+WsxpDOzFT4SF7iFQ5DYxCvbBwEv6EK6i4fQDvt7/JxVQlMxSqXtiIESx6o0SJN2oi9R0A4Hsw4BKQUBwaRBb+5W5Um/dpS5wJ4wzbc0xYYt0JBcxiRvAksNxwCQ/uBRDqn3/TwZ+c1CvtgcBFBsSVu7npbJQChylhDev+GlrECXYJEx32N2KB1E4labKOLV4vZZ3sa3Pr44qB4iMRNvtiy9PDJvC43yXfj9NcAkues+EecDHrQAAAQ8AAAAHc3NoLXJzYQAAAQAzIYF1gQgZJp52SI2AEAii12gUcBZLHjqhu2JOonjFlVXdhzWxMEkrh8bDkAYxKQM2hVRSBazEBquKeSnXu9ffFOMonPIczzLmRaJLinMWKMLpVprbDzHdo8WqkWFze16QsUvmFIM8cvyO+8ZVMVS1KTGIQKyZEpcCCR/c0Dy5CEOLc9tiU2Xx8RDP35cjbrepe4wxnRaf5/cgDYX7dFErluByOmu9ZfPnWwxdNbo/5ffdh/GrjkHUSA1uRD1GYYf1mp6IGgb5lKjSFXm6U475bY4vbZ4jozvyNlXlH9b763ecLMVYZo1+iJjiGTP6iHDK+rRqVbL1ePMYUJ8QQZXL  jim@macbook-2017
```

Note the flag `-n jim`!
The flag `-n jim` adds `jim` to the list of "principals" in the certificate.
For a client certificate, a principal is a _username_ on the server.
The server will reject a client certificate without a principal.
We can see that the principal is added to the certificate with:

```console
root@ca:~/sshca$ ssh-keygen -L -f jim_id25519-cert.pub
jim_id25519-cert.pub:
        Type: ssh-ed25519-cert-v01@openssh.com user certificate
        Public key: ED25519-CERT 46:ce:57:93:89:50:ae:a7:5b:93:fa:57:fc:17:d7:c6
        Signing CA: RSA e4:1c:e1:b1:98:a6:d0:29:7b:64:88:32:b3:15:e0:54
        Key ID: "jim@macbook-2017"
        Serial: 0
        Valid: forever
        Principals:
                jim
        Critical Options: (none)
        Extensions:
                permit-X11-forwarding
                permit-agent-forwarding
                permit-port-forwarding
                permit-pty
                permit-user-rc
```

Next, we must copy this certificate to Jim's machine,
so that Jim's client SSH can use it to authenticate:

```console
jim@laptop:~$ cat <<EOF > ~/.ssh/id_ed25519-cert.pub
> ssh-ed25519-cert-v01@openssh.com AAAAIHNzaC1lZDI1NTE5LWNlcnQtdjAxQG9wZW5zc2guY29tAAAAIK1eJnSCVKdC7E2+7P/5J2yaCmivgC5jpb6G4iTRdG6aAAAAIG98Y8egOBwfMdR5Wv7Wam/Y4ww5nzukBHBGDx/vnJvmAAAAAAAAAAAAAAABAAAAEGppbUBtYWNib29rLTIwMTcAAAAHAAAAA2ppbQAAAAAAAAAA//////////8AAAAAAAAAggAAABVwZXJtaXQtWDExLWZvcndhcmRpbmcAAAAAAAAAF3Blcm1pdC1hZ2VudC1mb3J3YXJkaW5nAAAAAAAAABZwZXJtaXQtcG9ydC1mb3J3YXJkaW5nAAAAAAAAAApwZXJtaXQtcHR5AAAAAAAAAA5wZXJtaXQtdXNlci1yYwAAAAAAAAAAAAABFwAAAAdzc2gtcnNhAAAAAwEAAQAAAQEA7ieiWFMD6oHSrfS0hNUCd8NX8JVC84uKp6soXRdOj/ZgWF5QBDO8JR8eobYXPFPVayzqAujA6yZzR4iWnxJG/AaVDMzEYMsFPj8+WsxpDOzFT4SF7iFQ5DYxCvbBwEv6EK6i4fQDvt7/JxVQlMxSqXtiIESx6o0SJN2oi9R0A4Hsw4BKQUBwaRBb+5W5Um/dpS5wJ4wzbc0xYYt0JBcxiRvAksNxwCQ/uBRDqn3/TwZ+c1CvtgcBFBsSVu7npbJQChylhDev+GlrECXYJEx32N2KB1E4labKOLV4vZZ3sa3Pr44qB4iMRNvtiy9PDJvC43yXfj9NcAkues+EecDHrQAAAQ8AAAAHc3NoLXJzYQAAAQAzIYF1gQgZJp52SI2AEAii12gUcBZLHjqhu2JOonjFlVXdhzWxMEkrh8bDkAYxKQM2hVRSBazEBquKeSnXu9ffFOMonPIczzLmRaJLinMWKMLpVprbDzHdo8WqkWFze16QsUvmFIM8cvyO+8ZVMVS1KTGIQKyZEpcCCR/c0Dy5CEOLc9tiU2Xx8RDP35cjbrepe4wxnRaf5/cgDYX7dFErluByOmu9ZfPnWwxdNbo/5ffdh/GrjkHUSA1uRD1GYYf1mp6IGgb5lKjSFXm6U475bY4vbZ4jozvyNlXlH9b763ecLMVYZo1+iJjiGTP6iHDK+rRqVbL1ePMYUJ8QQZXL  jim@macbook-2017
> EOF
```

Let's clear `~jim/.ssh/authorized_keys` on the server,
and try authenticating with the new certificate instead:

```console
jim@laptop:~$ ssh -i ~/.ssh/id_ed25519 cloud.jameshfisher.com
jim@cloud.jameshfisher.com: Permission denied (publickey).
```

Whoops; we forgot to tell the server to respect the certificate authority.
We told the SSH client to trust the CA with a new line in `known_hosts`,
but on the server,
we instead configure this with a line in `/etc/ssh/sshd_config`:

```console
root@cloud:~$ cat <<EOF > /etc/ssh/ca.pub
> ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDuJ6JYUwPqgdKt9LSE1QJ3w1fwlULzi4qnqyhdF06P9mBYXlAEM7wlHx6hthc8U9VrLOoC6MDrJnNHiJafEkb8BpUMzMRgywU+Pz5azGkM7MVPhIXuIVDkNjEK9sHAS/oQrqLh9AO+3v8nFVCUzFKpe2IgRLHqjRIk3aiL1HQDgezDgEpBQHBpEFv7lblSb92lLnAnjDNtzTFhi3QkFzGJG8CSw3HAJD+4FEOqff9PBn5zUK+2BwEUGxJW7uelslAKHKWEN6/4aWsQJdgkTHfY3YoHUTiVpso4tXi9lnexrc+vjioHiIxE2+2LL08Mm8LjfJd+P01wCS56z4R5wMet ca@jameshfisher.com
> EOF
root@cloud:~$ echo "TrustedUserCAKeys /etc/ssh/ca.pub" >> /etc/ssh/sshd_config
root@cloud:~$ sudo service ssh restart
```

Finally, Jim can SSH to the server using his client certificate:

```console
jim@laptop:~$ ssh -v -i ~/.ssh/id_ed25519 cloud.jameshfisher.com
...
debug1: Offering public key: ED25519-CERT SHA256:NyVqDVysRM0iNBlpLs9iQqaSPS8DJnoBAlrFgfSEEPQ /Users/jim/.ssh/id_ed25519
debug1: Server accepts key: pkalg ssh-ed25519-cert-v01@openssh.com blen 867
debug1: sign_and_send_pubkey: no separate private key for certificate "/Users/jim/.ssh/id_ed25519"
debug1: Authentication succeeded (publickey).
...
jim@cloud:~$
```
