---
title: What does `getaddrinfo` do?
tags:
  - programming
  - c
  - unix
hnUrl: 'https://news.ycombinator.com/item?id=30444336'
hnUpvotes: 2
---

The following C program calls `getaddrinfo("google.com", ...)`,
a function from `sys/socket.h`.
On the face of it,
`getaddrinfo` is used to do DNS lookups.

```c
#include <stdio.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>
#include <arpa/inet.h>
int main(void) {
  struct addrinfo* addr;
  int result = getaddrinfo("google.com", NULL, NULL, &addr);
  if (result != 0) {
    printf("Error from getaddrinfo: %s\n", gai_strerror(result));
    return 1;
  }
  struct sockaddr_in* internet_addr = (struct sockaddr_in*) addr->ai_addr;
  printf("google.com is at: %s\n", inet_ntoa(internet_addr->sin_addr));
  return 0;
}
```

For me, this program prints:

```console
$ cc main.c
$ ./a.out
google.com is at: 216.58.208.142
```

Great!
But what is this program doing to determine that `google.com` can be found at `216.58.208.142`?
You might imagine that `getaddrinfo` is a wrapper around a DNS request,
and that if we snooped on the traffic,
we'd see two UDP packets,
one for request and one for response:

```console
$ sudo tcpdump -v 'host 10.0.2.3'
17:37:39.915177 IP (tos 0x0, ttl 64, id 21777, offset 0, flags [DF], proto UDP (17), length 56)
    vagrant-ubuntu-trusty-64.55983 > 10.0.2.3.domain: 47922+ A? google.com. (28)
17:37:39.942126 IP (tos 0x0, ttl 64, id 2975, offset 0, flags [none], proto UDP (17), length 72)
    10.0.2.3.domain > vagrant-ubuntu-trusty-64.55983: 47922 1/0/0 google.com. A 216.58.208.142 (44)
```

We do see those packets: a request for an `A` record for `google.com`, and its response.
But that's not all we see.
The following is the real output,
showing an additional request/response for an `AAAA` record.
This asks for an IPv6 address, and the server replies with `2a00:1450:4009:803::200e`.

```
$ sudo tcpdump -v 'host 10.0.2.3'
17:37:39.915177 IP (tos 0x0, ttl 64, id 21777, offset 0, flags [DF], proto UDP (17), length 56)
    vagrant-ubuntu-trusty-64.55983 > 10.0.2.3.domain: 47922+ A? google.com. (28)
17:37:39.915667 IP (tos 0x0, ttl 64, id 21778, offset 0, flags [DF], proto UDP (17), length 56)
    vagrant-ubuntu-trusty-64.55983 > 10.0.2.3.domain: 61082+ AAAA? google.com. (28)
17:37:39.942126 IP (tos 0x0, ttl 64, id 2975, offset 0, flags [none], proto UDP (17), length 72)
    10.0.2.3.domain > vagrant-ubuntu-trusty-64.55983: 47922 1/0/0 google.com. A 216.58.208.142 (44)
17:37:39.945624 IP (tos 0x0, ttl 64, id 2977, offset 0, flags [none], proto UDP (17), length 84)
    10.0.2.3.domain > vagrant-ubuntu-trusty-64.55983: 61082 1/0/0 google.com. AAAA 2a00:1450:4009:803::200e (56)
```

This isn't so bad.
But oh boy, is `getaddrinfo` more complex than this!
We've seen what `getaddrinfo` does using `tcpdump`;
now let's try another angle: `strace`.
This shows all system calls that our program makes:

```
$ strace ./a.out
execve("./a.out", ["./a.out"], [/* 20 vars */]) = 0
brk(0)                                  = 0x1fbf000
...
...
```

I initially dumped the entire strace output into this blog post,
but then decided it was too large and you'd get put off.
The `getaddrinfo` function call alone causes over 100 system calls!
Files are read,
dynamic libraries are loaded,
obscure sockets are opened to the kernel,
obscure sockets are opened to non-existent daemons, multiple times ...
So let's break it down,
and I'll try to reduce it to the most relevant system calls.
Stay with me as I attempt to trace the crazy path of address lookup on Linux.

But first, let's see the money shot,
the system calls which make a DNS request to the DNS server and read the response:

{% raw %}
```
socket(PF_INET, SOCK_DGRAM|SOCK_NONBLOCK, IPPROTO_IP) = 3
connect(3, {sa_family=AF_INET, sin_port=htons(53), sin_addr=inet_addr("10.0.2.3")}, 16) = 0
poll([{fd=3, events=POLLOUT}], 1, 0)    = 1 ([{fd=3, revents=POLLOUT}])
sendmmsg(3, {{{msg_name(0)=NULL, msg_iov(1)=[{"\244>\1\0\0\1\0\0\0\0\0\0\6google\3com\0\0\1\0\1", 28}], msg_controllen=0, msg_flags=0}, 28}, {{msg_name(0)=NULL, msg_iov(1)=[{"\332\263\1\0\0\1\0\0\0\0\0\0\6google\3com\0\0\34\0\1", 28}], msg_controllen=0, msg_flags=0}, 28}}, 2, MSG_NOSIGNAL) = 2
poll([{fd=3, events=POLLIN}], 1, 5000)  = 1 ([{fd=3, revents=POLLIN}])
ioctl(3, FIONREAD, [44])                = 0
recvfrom(3, "\244>\201\200\0\1\0\1\0\0\0\0\6google\3com\0\0\1\0\1\300\f\0\1"..., 2048, 0, {sa_family=AF_INET, sin_port=htons(53), sin_addr=inet_addr("10.0.2.3")}, [16]) = 44
poll([{fd=3, events=POLLIN}], 1, 4981)  = 1 ([{fd=3, revents=POLLIN}])
ioctl(3, FIONREAD, [56])                = 0
recvfrom(3, "\332\263\201\200\0\1\0\1\0\0\0\0\6google\3com\0\0\34\0\1\300\f\0\34"..., 65536, 0, {sa_family=AF_INET, sin_port=htons(53), sin_addr=inet_addr("10.0.2.3")}, [16]) = 56
close(3)                                = 0
```
{% endraw %}

The above system calls correlate with the UDP packet dump.
Two packets are sent with one `sendmmsg`,
then the two responses are read with `recvfrom`.

(Notice in passing the calls to `poll`,
blocking the entire process for up to 5 seconds waiting for the DNS response.
In a program with an event loop or "green threads", this can be disastrous.
`getaddrinfo` does not play nicely with your event loop!)

But `getaddrinfo` does a lot before these system calls,
and it does quite a bit after them, too.
You see the UDP "connection" is to a DNS server at `10.0.2.3`.
But how did `getaddrinfo` know about `10.0.2.3`?
It's not a function argument.
Just before the DNS request,
the process makes these system calls:

```
open("/etc/resolv.conf", O_RDONLY|O_CLOEXEC) = 3
read(3, "# Dynamic resolv.conf(5) file fo"..., 4096) = 182
```

`getaddrinfo` gets the DNS server's IP address from a file at `/etc/resolv.conf`!
Here's my `/etc/resolv.conf`:

```console
$ cat /etc/resolv.conf
# Dynamic resolv.conf(5) file for glibc resolver(3) generated by resolvconf(8)
#     DO NOT EDIT THIS FILE BY HAND -- YOUR CHANGES WILL BE OVERWRITTEN
nameserver 10.0.2.3
search lan
```

As the comments in the file imply,
there's a complex process which generates the `resolv.conf`.
Ultimately, the IP address comes from DHCP,
but this is another story.

But host addresses information doesn't only come from DNS!
There's another source of information on UNIX systems:
the file `/etc/hosts`.
Here's mine:

```console
$ cat /etc/hosts
127.0.0.1 localhost

# The following lines are desirable for IPv6 capable hosts
::1 ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
ff02::3 ip6-allhosts
```

If I add the line `1.2.3.4 google.com`,
the output of my program changes:

```console
$ ./a.out
google.com is at: 1.2.3.4
```

`getaddrinfo` gets info from `/etc/hosts` in the obvious way,
by reading that file in full every time you call it:

```
open("/etc/hosts", O_RDONLY|O_CLOEXEC)  = 3
read(3, "127.0.0.1 localhost\n\n# The follo"..., 4096) = 221
```

For some time I thought this was the whole story,
and that the C standard library has hardcoded knowledge of `/etc/hosts` and `/etc/resolv.conf`.
But in fact, the C standard library doesn't have knowledge of either of these files!
This knowledge is actually coded in some shared dynamic libraries.
The file `/etc/hosts` is known by `/lib/x86_64-linux-gnu/libnss_files.so.2`,
and `/etc/resolv.conf` is known by `/lib/x86_64-linux-gnu/libnss_dns.so.2`.
Those libraries are loaded at runtime by our process,
like this:

```
open("/lib/x86_64-linux-gnu/libnss_dns.so.2", O_RDONLY|O_CLOEXEC) = 3
read(3, "\177ELF\2\1\1\0\0\0\0\0\0\0\0\0\3\0>\0\1\0\0\0\0\21\0\0\0\0\0\0"..., 832) = 832
fstat(3, {st_mode=S_IFREG|0644, st_size=22952, ...}) = 0
mmap(NULL, 2117896, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f5216c88000
mprotect(0x7f5216c8d000, 2093056, PROT_NONE) = 0
mmap(0x7f5216e8c000, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x4000) = 0x7f5216e8c000
```

You might think, "Jim, you're being picky.
This is still the C standard library;
it just lazily loads its `files` and `dns` libraries."
But this is not how it works!
Although we think of `getaddrinfo` as "do DNS lookup",
its `man` page never even mentions DNS!:

> Given `node` and `service`,
> which identify an Internet host and a service,
> `getaddrinfo()` returns one or more `addrinfo` structures,
> each of which contains an Internet address
> that can be specified in a call to `bind(2)` or `connect(2)`.

`getaddrinfo` doesn't know anything about files, DNS,
or any other way to find the address for a host.
Instead, `getaddrinfo` gets a list of these "sources" at runtime
from _another_ file, `/etc/nsswitch.conf`, the "Name Service Switch".
Here's some of mine:

```console
$ cat /etc/nsswitch.conf
passwd:         compat
hosts:          files myhostname dns
networks:       files
```

Notice the line `hosts: files myhostname dns`.
This says, "to find a host,
first ask the library `libnss_files.so`.
If that fails, ask the library `libnss_myhostname.so`.
Finally, ask the library `libnss_dns.so`."
The C standard library interpolates `files`, `dns` and so on
into the pattern `libnss_%s.so` to find the libraries.
As such, you could write a new library `libnss_imfeelinglucky`,
and change your `nsswitch.conf` to `hosts: imfeelinglucky`.
Enjoy the chaos.

You might think we're done.
Not yet!
Before `getaddrinfo` does any of this,
we have these system calls:

```
socket(PF_LOCAL, SOCK_STREAM|SOCK_CLOEXEC|SOCK_NONBLOCK, 0) = 3
connect(3, {sa_family=AF_LOCAL, sun_path="/var/run/nscd/socket"}, 110) = -1 ENOENT (No such file or directory)
close(3)                                = 0
```

What is `/var/run/nscd/socket` ..?
Linux tells us, with `ENOENT`, that I don't have that file!
What is this supposed to be?
As Google will tell you,
this is a socket to talk to the Northern School of Contemporary Dance.
But before your process can go to class,
you have to install the daemon:

```console
$ sudo apt-get install nscd
...
Setting up nscd (2.19-0ubuntu6.14) ...
 * Starting Name Service Cache Daemon
```

Sorry, `nscd` is actually the "name service cache daemon",
"a daemon that provides a cache for the most common name service requests".
After installing it, the daemon starts,
and your process can dance:

```
socket(PF_LOCAL, SOCK_STREAM|SOCK_CLOEXEC|SOCK_NONBLOCK, 0) = 4
connect(4, {sa_family=AF_LOCAL, sun_path="/var/run/nscd/socket"}, 110) = 0
sendto(4, "\2\0\0\0\r\0\0\0\6\0\0\0hosts\0", 18, MSG_NOSIGNAL, NULL, 0) = 18
poll([{fd=4, events=POLLIN|POLLERR|POLLHUP}], 1, 5000) = 1 ([{fd=4, revents=POLLIN|POLLERR|POLLHUP}])
recvmsg(4, 0x7fff7a50f5f0, MSG_CMSG_CLOEXEC) = -1 ECONNRESET (Connection reset by peer)
close(-1)                               = -1 EBADF (Bad file descriptor)
close(4)                                = 0
close(3)                                = 0
socket(PF_LOCAL, SOCK_STREAM|SOCK_CLOEXEC|SOCK_NONBLOCK, 0) = 3
connect(3, {sa_family=AF_LOCAL, sun_path="/var/run/nscd/socket"}, 110) = -1 ECONNREFUSED (Connection refused)
close(3)
```

Oh, wait, no.
The daemon reset the connection.
Then a bug in glibc closes the file descriptor `-1`.
Then glibc tries to connect to NSCD again, just to make sure.
(Oh, glibc doesn't just do that in this circumstance. glibc tries twice, every time.)
So what happened?

```console
$ sudo tail -2 /var/log/kern.log
Feb  3 19:36:17 vagrant-ubuntu-trusty-64 kernel: [11799.496494] nscd[3677]: segfault at 43c000010 ip 00007fba29180753 sp 00007fba1e4741f0 error 4 in nscd[7fba2916c000+25000]
Feb  3 19:39:46 vagrant-ubuntu-trusty-64 kernel: [12008.644917] nscd[3758]: segfault at 0 ip 00007ff37679cdfa sp 00007ff36ce901e8 error 4 in libc-2.19.so[7ff376714000+1be000]
```

Turns out that `nscd` segfaulted.
As everyone on the internet will tell you,
`nscd` is "shit", "unstable", and "badly designed".
But no worries:
as part of the C standard library,
nscd is not this program but a standard protocol,
part of the standard UNIX specification,
with many alternative implementations!

At least, that's what I thought.
As it turns out,
the source of `nscd` is buried in `glibc`.
(Despite this program not being part of libc!)
The protocol for `nscd` is not specified,
and there are virtually no alternative implementations!
`nscd` is _not_ part of the C standard library.
If you use a different implementation like `musl-libc`,
your programs won't look for the name server cache daemon.

Rant over, back on track.
Before glibc looks for `nscd`,
it does some even more mysterious stuff:

```
socket(PF_NETLINK, SOCK_RAW, 0)         = 3
bind(3, {sa_family=AF_NETLINK, pid=0, groups=00000000}, 12) = 0
getsockname(3, {sa_family=AF_NETLINK, pid=2166, groups=00000000}, [12]) = 0
sendto(3, "\24\0\0\0\26\0\1\3\1\345uZ\0\0\0\0\0\0\0\0", 20, 0, {sa_family=AF_NETLINK, pid=0, groups=00000000}, 12) = 20
recvmsg(3, {msg_name(12)={sa_family=AF_NETLINK, pid=0, groups=00000000}, msg_iov(1)=[{"D\0\0\0\24\0\2\0\1\345uZv\10\0\0\2\10\200\376\1\0\0\0\10\0\1\0\177\0\0\1"..., 4096}], msg_controllen=0, msg_flags=0}, 0) = 148
recvmsg(3, {msg_name(12)={sa_family=AF_NETLINK, pid=0, groups=00000000}, msg_iov(1)=[{"@\0\0\0\24\0\2\0\1\345uZv\10\0\0\n\200\200\376\1\0\0\0\24\0\1\0\0\0\0\0"..., 4096}], msg_controllen=0, msg_flags=0}, 0) = 128
recvmsg(3, {msg_name(12)={sa_family=AF_NETLINK, pid=0, groups=00000000}, msg_iov(1)=[{"\24\0\0\0\3\0\2\0\1\345uZv\10\0\0\0\0\0\0", 4096}], msg_controllen=0, msg_flags=0}, 0) = 20
```

Our process uses a `PF_NETLINK` socket to talk to the kernel.
But what is it saying?
The glibc source says it's trying to find
"information about what interfaces are available.
Also determine whether we have IPv4 or IPv6 interfaces or both."
It's not clear why our program needs to know what interfaces are available.

BUT WAIT THERE'S STILL MORE!
After our process has its DNS responses,
it does more work.
It starts by reading `/etc/gai.conf`,
the "Configuration for `getaddrinfo(3)`."
The function call has its very own configuration file!
Luckily, mine is only comments.

Once `getaddrinfo` has the addresses,
you'd think it would just return them.
But first, it makes some tests on those addresses,
opening sockets to them and connecting:

```
socket(PF_INET, SOCK_DGRAM, IPPROTO_IP) = 3
connect(3, {sa_family=AF_INET, sin_port=htons(0), sin_addr=inet_addr("216.58.208.142")}, 16) = 0
getsockname(3, {sa_family=AF_INET, sin_port=htons(59663), sin_addr=inet_addr("10.0.2.15")}, [16]) = 0
close(3)                                = 0
socket(PF_INET6, SOCK_DGRAM, IPPROTO_IP) = 3
connect(3, {sa_family=AF_INET6, sin6_port=htons(0), inet_pton(AF_INET6, "2a00:1450:4009:803::200e", &sin6_addr), sin6_flowinfo=0, sin6_scope_id=0}, 28) = -1 ENETUNREACH (Network is unreachable)
close(3)                                = 0
```

One last thing.
You might think that `getaddrinfo` caches answers,
so subsequent calls aren't so expensive.
It does not!
It does this entire procedure every time!
