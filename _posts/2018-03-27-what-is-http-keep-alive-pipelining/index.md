---
title: What is HTTP keep-alive? What is HTTP request pipelining?
tags:
  - programming
  - networking
summary: >-
  HTTP keep-alive allows reusing the same TCP connection for multiple requests,
  avoiding the overhead of opening a new connection. HTTP request pipelining
  sends multiple requests without waiting for their responses.
---

Traditional HTTP uses one TCP connection per request.
The client opens the connection and sends the request.
The server then sends the response and closes the connection.
We can do this manually using netcat (`nc`),
sending a test request to [httpbin.org](https://httpbin.org):

```console
$ printf "GET /status/200 HTTP/1.1\r\nHost: httpbin.org\r\n\r\n" | nc httpbin.org 80
HTTP/1.1 200 OK
Connection: keep-alive
Server: meinheld/0.6.1
Date: Tue, 27 Mar 2018 21:34:51 GMT
Content-Type: text/html; charset=utf-8
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
X-Powered-By: Flask
X-Processed-Time: 0
Content-Length: 0
Via: 1.1 vegur

$
```

What should we do to make two requests?
Traditionally, the client would open two TCP connections.
But a new TCP connection is costly;
it takes time, network bandwidth, and CPU usage (especially if using TLS).
The HTTP "keep-alive" feature allows us to use the same TCP connection for multiple HTTP requests.
The header `Connection: keep-alive` asks the server
to keep the TCP connection open after the server has sent its response,
so that the client can send further requests on it.

To send another request,
the client appends the second request to the first.
Similarly, when the server replies with a second response on the same connection,
it appends it to the first response.
Let's see this in action:

```console
$ cat <(printf "GET /status/200 HTTP/1.1\r\nHost: httpbin.org\r\nConnection: keep-alive\r\n\r\n") \
      <(printf "GET /status/200 HTTP/1.1\r\nHost: httpbin.org\r\nConnection: close\r\n\r\n") \
  | nc httpbin.org 80
HTTP/1.1 200 OK
Connection: keep-alive
Server: meinheld/0.6.1
Date: Tue, 27 Mar 2018 21:51:48 GMT
Content-Type: text/html; charset=utf-8
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
X-Powered-By: Flask
X-Processed-Time: 0
Content-Length: 0
Via: 1.1 vegur

HTTP/1.1 200 OK
Connection: close
Server: meinheld/0.6.1
Date: Tue, 27 Mar 2018 21:51:48 GMT
Content-Type: text/html; charset=utf-8
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
X-Powered-By: Flask
X-Processed-Time: 0
Content-Length: 0
Via: 1.1 vegur

$
```

Actually, the `Connection: keep-alive` header is unnecessary,
because it's the default in HTTP/1.1.
`Connection: close` is the way to explicitly tell the server
to close the connection after sending the response.

Because the requests are joined with simple concatenation,
we need to be able to determine where one request ends and the next begins.
The header section is always terminated by `\r\n\r\n`.
There are a couple of ways to specify the body section length.
One is the `Content-Length` header.
Another method to specify the end of the request
is to use `Content-Encoding: chunked`.
This is necessary for streaming a request body,
where the length is not known in advance.

HTTP keep-alive also allows "pipelining".
Pipelining means sending further requests without waiting for responses.
The two requests we sent in the previous example were pipelined.
This is possible in HTTP because, in general,
sending request _n_+1 does not require any information from response _n_.
