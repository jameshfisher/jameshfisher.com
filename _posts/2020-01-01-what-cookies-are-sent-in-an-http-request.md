---
title: "What cookies are sent in an HTTP request?"
tags: ["programming", "web"]
draft: true
---

Your browser stores a bunch of "cookies".
Compared to other client-side web storage
(`localStorage`, `sessionStorage`, `indexedDB`, ...),
the unique property of cookies is that,
when the browser makes an HTTP request,
cookies are embedded in the request sent to the server.

The cookies are included in an HTTP header called `Cookie`.
For example,
in the developer tools for this page,
under "Network",
you'll see an HTTP request for `https://jameshfisher.com/assets/jim_512.jpg`,
a picture of me.
In the HTTP headers for that request, you can see:

```
Cookie: _ga=GA1.2.12345.67890; _gid=GA1.2.111111.222222
```

But why were these cookies sent,
and not the many others stored by my browser?
The answer is not simple!

Cookies have many attributes;
among them are the _domain_ and _path_ attributes,
which together are called the cookie's "scope".
Both Google Analytics cookies above have the domain `.jameshfisher.com` and the path `/`.
You can see these attributes in the _Application_ tab of Google Chrome developer tools.

These attributes are set when the cookie is set,
for example in client-side JavaScript using the API:
`document.cookie = 'test_cookie=foo'`.
When setting a cookie,
the default domain is the domain of the current page,
i.e. `jameshfisher.com`,
and the default path is the path of the current page,
i.e. `/2020/01/01/what-cookies-are-sent-in-an-http-request`.

Note the domain attributes of these two cookies are different:
`.jameshfisher.com` versus `jameshfisher.com`.
The leading dot means "this is a domain suffix";
a cookie with domain `.jameshfisher.com` will match `subdomain.jameshfisher.com`, too.
A cookie with domain `jameshfisher.com` will only match the domain `jameshfisher.com`,
and will not match subdomains.
Confusingly, whether the domain attribute is a suffix is determined by
_whether_ you explicitly set the domain attribute when setting the cookie.
If you explicitly set a domain attribute when setting the cookie,
it will be a domain suffix (shown with leading dot).
If you don't explicitly set a domain attribute,
it will be a fully-qualified domain,
i.e. `jameshfisher.com` in this example.

A cookie is only sent in an HTTP request
if the hostname that the request is being sent to
matches the domain, or domain suffix,
in the cookie.
The browser will never send a cookie
to a hostname that doesn't match the cookie's domain attribute.

An HTTP origin 

An HTTP request made by a browser has two relevant _origins_:
the origin that makes the request,
and the origin that the request is sent to.

Whether cookies are sent depends on how the request was made.
There are many APIs to invoke an HTTP request from a browser:

* The user follows a link, i.e. clicks on an  `<a>` element.
  Cookies are sent.
* The user submits a form, e.g. clicks on a `<button type="submit">` element.
  Cookies are sent.
* The page loads some media, e.g. an image via an `<img>` element.
  Cookies are sent.
* The page loads a script from a `<script>` element.
  Cookies are sent, unless the element has `crossorigin=anonymous` set.
* Some JavaScript on the page invokes `XMLHttpRequest`.
  
* Some JavaScript on the page calls `fetch`.




* The attributes of the cookie (domain and path)
* The domain and path of the URL the request is being made to
* The domain and path of the page making the request (???)










To test this behavior, 
I've set up some domains in `/etc/hosts`:

```
$ cat /etc/hosts
...
127.0.0.1       s1.com
127.0.0.1       s2.com
127.0.0.1	      sub.s2.com
```

And I'm running the "web servers" for `s1.com` and `s2.com` using `nc`, like so:

```
$ while true; do cat response.http | nc -l 8000; done
```

This lets me control the full HTTP response by typing it out.
Here's a starter page:

```
$ cat index.http
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8

<!doctype html>
<html><body><h1>A webpage served by netcat</h1></body></html>
```

Then run `nc` in an infinite loop to serve this file for every response:


When the browser makes an HTTP request,
it will include each cookie
whose scope matches the target URL.
