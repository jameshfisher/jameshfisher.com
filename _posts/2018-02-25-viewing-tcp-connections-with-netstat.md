---
title: "Viewing TCP connections with netstat"
draft: true
---

`netstat -tpn` shows TCP connections on your current machine.
Start a TCP server with `nc -l 127.0.0.2 -p 12345`,
then connect to it with `nc 127.0.0.2 12345`.
After this, we can see the connection:

```console
$ sudo netstat -tpn
Active Internet connections (w/o servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 127.0.0.2:12345         127.0.0.1:39548         ESTABLISHED 5441/nc
tcp        0      0 127.0.0.1:39548         127.0.0.2:12345         ESTABLISHED 5445/nc
```

Notice our one TCP connection is listed twice!
We can see why by running `strace` on `netstat`:
it traverses every process in `/proc`.
