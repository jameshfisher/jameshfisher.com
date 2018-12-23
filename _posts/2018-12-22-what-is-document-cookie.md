---
title: "What is document.cookie?"
tags: ["programming", "web"]
---

I've used cookies as a web developer for many years,
but never understood them in detail.
In this post, I look at the `document.cookie` API.

Cookies are client-side storage.
Cookies were the first client-side storage available in the browser.
They have three main use-cases:
sessions, preferences, and tracking.
Nowadays, there are three more client-side storage APIs:
`localStorage`, `sessionStorage`, and `indexedDB`,
Arguably, cookies are obsoleted by these newer APIs,
but you still need to know about cookies,
because they won't go away any time soon!

You can view cookies for this website, jameshfisher.com, in Google Chrome by opening:
Developer tools > Application > Storage > Cookies > `https://jameshfisher.com`.
There, you'll see two or three cookies.

Cookies have a bunch of standard attributes.
A fundamental one is the _name_.
You'll see cookies on this page called `_ga` and `_gid`.
These cookies were set by Google Analytics,
which I use to track visitors to this website.
Many sites use Google Analytics,
and if you view the cookies on those sites,
you'll also see `_ga` and `_gid`:
they are standard names used by Google.

Alternatively, you can view the cookies from the JavaScript console,
using `document.cookie`:

```
> document.cookie
"_ga=GA1.2.12345.67890; _gid=GA1.2.111111.222222"
```

Rather oddly, the cookies come back as a string!
The form is roughly as follows.
We'll revisit this when we look at how cookies are transferred over HTTP.

```
cookieString ::= cookie [ "; " cookieString ]
cookie ::= name "=" value
```

You can set some cookies yourself!
From the console, assign a new cookie to `document.cookie`
which sets the cookie `bgcolor` to the value `mintcream`:

```
> document.cookie = "bgcolor=mintcream";
> document.cookie
"_ga=GA1.2.12345.67890; _gid=GA1.2.111111.222222; bgcolor=mintcream"
```

Yes, this API is pretty weird!
Formatted strings as arguments,
formatted strings as return values,
and a horrible abuse of assignment.
The reasons are lost to the dark ages of the browser.
[Google seem to be designing a better replacement API](https://developers.google.com/web/updates/2018/09/asynchronous-access-to-http-cookies),
but it's early days, so we're stuck with `document.cookie`.

Assigning to cookies is not much use unless we can access them.
Let's say we want to use the value of `bgcolor` to style the page.
To do so, we have to parse out the cookie and extract the value,
like so:

```
> document.body.style.backgroundColor = document.cookie.split(';').filter(c => c.startsWith(' bgcolor='))[0].split('=')[1]
```

If you think this API is bad so far, just wait:
it only gets worse from here!

Your browser stores lots of cookies.
but in each tab, only some of those cookies are used.
On this page, only two or three cookies are used.
Two cookie attributes determine whether the cookie is used:
the cookie's _domain_ and the cookie's _path_.
Together, the domain and path are called the cookie's "scope".

For the Google Analytics cookies,
the domain value is `.jameshfisher.com`,
and the path value is `/`.
The cookie's domain and path are matched against the full URL of this page,
which is `https://jameshfisher.com/2018/12/22/what-is-document-cookie`.
The cookie's domain `.jameshfisher.com` matches the URL's domain `jameshfisher.com`,
and the cookie's path `/` matches the URL's path `/2018/12/22/what-is-document-cookie`,
so the cookie is used on this page.

The cookie's domain `.jameshfisher.com` is really a domain _suffix_:
it matches the domain `jameshfisher.com`,
or any subdomains such as `www.jameshfisher.com`
or `a.b.c.jameshfisher.com`.
And the cookie's path `/` is really a path _prefix_:
it matches all paths!

Notice, though, that the `bgcolor` cookie we set earlier with JavaScript
does not have the domain `.jameshfisher.com`;
it has the domain `jameshfisher.com`, without a leading dot.
This only matches the domain `jameshfisher.com` - no subdomains!
So a cookie domain beginning with `.` is a domain suffix;
otherwise, it's a fully qualified domain.

The cookie `bgcolor` got the domain `jameshfisher.com`
because the default cookie domain is the domain of the current page.
To make `bgcolor` available to subdomains,
you can set the `domain` explicitly to `.jameshfisher.com`
by appending `;domain=.jameshfisher.com` to the assignment:

```
> document.cookie = "bgcolor=mintcream;domain=.jameshfisher.com";
> document.cookie
"_ga=GA1.2.12345.67890; _gid=GA1.2.111111.222222; bgcolor=mintcream; bgcolor=mintcream"
```

But what's this?
We now have _two_ cookies called `bgcolor`!
By checking the cookies listed in developer tools,
you can see the two cookies:
one for `jameshfisher.com`, and another for `.jameshfisher.com`.
If you consider the browser's cookies as a big relational table,
the unique key is (domain, path, name).
We have two cookies:
first, (`jameshfisher.com`, `/2018/12/22`, `bgcolor`),
and second, (`jameshfisher.com`, `/2018/12/22`, `bgcolor`).

It was not obvious from the value of `document.cookie` that those two cookies had different domains.
Those cookie attributes are omitted entirely in `document.cookie`.
In fact, from JavaScript, you only have access to the name and value of the cookie,
and no access to any other attributes such as the domain or path!

Let's say we wanted the cookie to be exposed to subdomains,
so we want to delete the cookie for `jameshfisher.com`.
But there is no explicit API for cookie deletion!
Instead, we have to use another cookie attribute: `expires`.
All cookies have an expiry time,
and we delete a cookie by setting its expiry time to the past!
We can do this by appending `;expires=Thu, 01 Jan 1970 00:00:01 GMT` to the cookie.
Let's do that for the cookie for `jameshfisher.com`:

```
> document.cookie = "bgcolor=mintcream;domain=jameshfisher.com;expires=Thu, 01 Jan 1970 00:00:01 GMT";
> document.cookie
"_ga=GA1.2.12345.67890; _gid=GA1.2.111111.222222; bgcolor=mintcream"
```

Back to one `bgcolor` cookie: all looks good!
But wait ... if you check the developer tools,
you'll see that _we deleted the wrong cookie_!
We asked to delete the cookie for `jameshfisher.com`,
but instead the cookie for `.jameshfisher.com` is gone!
What happened?!

It turns out,
if you explicitly specify the domain when setting a cookie,
this _always_ means a domain suffix.
So even if you specify `;domain=jameshfisher.com`,
this gets interpreted as `;domain=.jameshfisher.com`!
(I told you this API was bad.)
The only way to delete the cookie for `jameshfisher.com`
is by omitting the `domain` attribute entirely,
allowing it to fall back to the default domain taken from the current page:

```
> document.cookie = "bgcolor=mintcream;expires=Thu, 01 Jan 1970 00:00:01 GMT";
> document.cookie
"_ga=GA1.2.12345.67890; _gid=GA1.2.111111.222222"
```

For both of our cookies, the path was `/2018/12/22`:
you can check this in developer tools.
But where did this path come from?
Because we didn't set the cookie's path explicitly,
it defaulted to _the directory of the current page_.
The full URL of this page is `https://jameshfisher.com/2018/12/22/what-is-document-cookie`.
The full path is `/2018/12/22/what-is-document-cookie`.
The directory of this path is `/2018/12/22`.
So this cookie matches the current page,
plus anything else I published on 2018-12-22
(of which there is nothing).
