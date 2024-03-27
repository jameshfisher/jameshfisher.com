---
title: How can I store things on the browser?
tags: []
---

The traditional web browser is a "thin client" which interacts with a web server.
The user's virtual shopping trolley is kept on the web server,
and the browser gets/sets it with HTTP requests.
But today's browsers support "fat" clients;
web applications can store state on the local browser.
There are lots of ways to store this state!
Let's look at some of them:

| Storage type                                                                                | Appeared  | Deprecated? | Support |
|---------------------------------------------------------------------------------------------|-----------|-------------|---------|
| [HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)                   | 1994      | No          | ~100%   |
| [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage)       | 2009      | No          | 94%     |
| [SessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)    | 2009      | No          | 94%     |
| [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)                 | 2010      | No          | 92%     |
| [CacheStorage](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage)               | 2013      | No          | 73%     |
| [WebSQL](https://en.wikipedia.org/wiki/Web_SQL_Database)                                    | 2009      | Yes, 2010   | 83%     |
| [AppCache](https://developer.mozilla.org/en-US/docs/Web/HTML/Using_the_application_cache)   | 2009      | Yes, 2015   | 93%     |
