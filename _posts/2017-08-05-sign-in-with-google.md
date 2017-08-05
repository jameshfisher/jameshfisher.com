---
title: "Signing in with Google, from scratch"
justification: "I've never implemented any pages with SSO! I need to know how it works."
---

Back in the dark ages (say, 2010), every web service requiring an account system implemented it themselves. Users had to sign up to create a new account and think of a new password, and the developer had to store those credentials securely. Today in 2017, most new sites and apps delegate their account system to big account systems, like Google or GitHub. In this new world, the user doesn't have to think of a new password, and the developer is not burdened with keeping a long-term secure vault of email addresses and password hashes.

To show how this works, I'm going to create a diary web service. I'll sign in with my Google account, after which I can view and edit some private text - my diary. The service is on Heroku:

```
$ heroku apps:create jim-diary
Creating ⬢ jim-diary... done
https://jim-diary.herokuapp.com/ | https://git.heroku.com/jim-diary.git
```

Next, I created a new "project" on [the Google API Console](https://console.developers.google.com/). The project is called "diary" and has the ID `diary-175912`. This is public information. Every Project has [OAuth consent screen settings](https://console.developers.google.com/apis/credentials/consent).

A Project has zero or more client credentials. I created one called "web-client". The configuration for this demands a JavaScript origin URI. For me, this is `https://jim-diary.herokuapp.com/`. I also added `http://localhost:8080`, which lets me test this locally.

Creating this client credential gave me a client ID, `59111089553-rqujjdb91g4s7h9p2v23hf2rdvc28med.apps.googleusercontent.com`. This is public information, to embed in the web client. It also gave me a "client secret", which I, the developer, must keep secret!

Next I started making the web app. I started with a hello world Go web server:

```go
package main
import (
	"net/http"
	"fmt"
	"os"
	"log"
)
func main() {
	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("Requires env var PORT")
	}
	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		if req.URL.Path != "/" {
			http.NotFound(w, req)
			return
		}
		fmt.Fprintf(w, "<!doctype html><html><head><meta charset='utf8'/></head><body><h1>Jim's diary</h1></body></html>")
	})
	http.ListenAndServe(":" + port, nil)
}
```

I need to extend this static home page to include a "Sign in with Google" button. I modified the Go server to read an HTML file:

```go
func main() {
	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("Requires env var PORT")
	}
	homeHtmlBytes, err := ioutil.ReadFile("home.html")
	if err != nil {
		log.Fatal("Could not read home.html")
	}
	homeHtml := string(homeHtmlBytes)
	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		if req.URL.Path != "/" {
			http.NotFound(w, req)
			return
		}
		fmt.Fprintf(w, homeHtml)
	})
	http.ListenAndServe(":" + port, nil)
}
```

The HTML for my homepage is as follows. Note the client ID in the `<meta name="google-signin-client_id">` tag.

```html
<!doctype html>
<html>
	<head>
		<meta charset='utf8'/>
		<meta name="google-signin-client_id" content="59111089553-rqujjdb91g4s7h9p2v23hf2rdvc28med.apps.googleusercontent.com"/>
		<title>Jim's diary</title>
		<script src="https://apis.google.com/js/platform.js" async defer></script>
	</head>
	<body>
		<h1>Jim's diary</h1>
		<div class="g-signin2" data-onsuccess="onSignIn"></div>
		<script>
			function onSignIn(googleUser) {
				var profile = googleUser.getBasicProfile();
				console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
				console.log('Name: ' + profile.getName());
				console.log('Image URL: ' + profile.getImageUrl());
				console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
			}
		</script>
	</body>
</html>
```

With this deployed, I get a page with a sign-in button on https://jim-diary.herokuapp.com/. Clicking it as a user, I go to a Google sign-in page. This then redirects me to https://jim-diary.herokuapp.com/, which prints some info to the console:

```
ID: 1234567890987654321234567890
Name: James Fisher
Image URL: https://lh5.googleusercontent.com/-lmu6NYO1MJo/AAAAAAAAAAI/AAAAAAAAAGQ/3KfSyQMrfR0/s96-c/photo.jpg
Email: jameshfisher@gmail.com
```

How did this happen? There are three actors in this story: the web page, the user, and Google. The web page wants details about the user's Google account. To get those, the page redirects the user to Google. Google then asks the user for proof of identity, and asks the user whether she wants to pass some basic details to the web page. The user says yes, and Google redirects back to the web page, together with those basic details about the user's Google account. The web page can then consider this as a proof that the current user has access to the Google account detailed.

A Google account has a numeric ID. This is different from the email address associated with the account. The email address for a Google account can change. We should consider the numeric ID to be the identity for the account.

Note that all this happened with a purely static web server. How do we now give the user access to their private diary? I would like to allow GET and PUT requests to `/google-account/:google_account_id/diary`. But these requests need to be authenticated - my server needs proof that the request comes from someone with access to that Google account.

These proofs are called "ID tokens". The web client has access to an ID token through `googleUser.getAuthResponse().id_token`. We can set it as a cookie so that it will be passed to the server when we make requests:

```js
function onSignIn(googleUser) {
	document.cookie = "google_id_token=" + googleUser.getAuthResponse().id_token + ";max-age="+(60*60*24*365)+";path=/";
}
```

On our server, when handling a request, we need to extract this token, verify it, and use it to identify the user. The token is a JSON Web Token, signed with one of [Google's three public keys](https://www.googleapis.com/oauth2/v3/certs). This validation process is rather laborious:

```go
package main

import (
	"github.com/dgrijalva/jwt-go"
	// ...
)

var googlePublicKeys map[string][]byte = map[string][]byte{
	"e3a4aa7d6b3c1622dce1fcf01b05631ebf479408": []byte("-----BEGIN CERTIFICATE-----\nMIIDJjCCAg6gAwIBAgIIcWY/+l6mD7MwDQYJKoZIhvcNAQEFBQAwNjE0MDIGA1UE\nAxMrZmVkZXJhdGVkLXNpZ25vbi5zeXN0ZW0uZ3NlcnZpY2VhY2NvdW50LmNvbTAe\nFw0xNzA4MDQxMTQzMzRaFw0xNzA4MDcxMjEzMzRaMDYxNDAyBgNVBAMTK2ZlZGVy\nYXRlZC1zaWdub24uc3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5jb20wggEiMA0GCSqG\nSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC9ECxnjVcYEVpMUX4Cui0QKewNq2Qgmbiu\n2pmjyQipYoccTFFXxcdHqnqn4nZbWPn4WVQIg80EOf+i1myZykPQLTPBI15Nx30B\n4l1z0qItflbNlBfd1nZw5DChF6zHZA2YqtAdDytEA6PdacVZipengnFPYl0Ui+wL\n4JMpeNZOiJwhtvyMvsrq155zmOcw0cr73zirtuPmTeEV1GMuW1o1TbusYmkI80s6\nBhFtt1NTAFcJ0Qk6/7DuJyofc9X7uWAbtzEmZBYc176znKpeHc10GQuh3SGQepJe\nr2YsY9wGVHTBB1GBuGp6uXaR5wXEhdGONjl0fAHxcbrRDs6KATivAgMBAAGjODA2\nMAwGA1UdEwEB/wQCMAAwDgYDVR0PAQH/BAQDAgeAMBYGA1UdJQEB/wQMMAoGCCsG\nAQUFBwMCMA0GCSqGSIb3DQEBBQUAA4IBAQCkbqu3TeGQT54tTkUheDqFQoxtOkMa\nhGAcZADONgj2/4vkZaFKGvCU5a0abBAUPviUpP3LTB3QP0cPOkCIL09R8HcMx3C5\nvf9qz3ySWwG3YPw2UX4CPjiHnfqVm9inVrTTVebw/Q9bi8QEQ302JvW+GjZjWAl3\n0geU52yDGAG9erC5mdYVm1qLL8xGs2w0fBbsQItR8N9D1aMmG+00cW0nQPdb8b1V\najS8SPOxV0THqkpwfh+7/oSr/IUUQ32uLWCkUVbizzXXI/TBcN+c4B4ffzIAINEU\niV0GHgvsAhyTODRyQNQADPh6F2g7ki+xz5ugg73tjaelryretXvq28Vg\n-----END CERTIFICATE-----\n"),
	"a4964c6cf5366da6de12e7d31d1008e4cce3171c": []byte("-----BEGIN CERTIFICATE-----\nMIIDJjCCAg6gAwIBAgIIIjPmdSfaDWYwDQYJKoZIhvcNAQEFBQAwNjE0MDIGA1UE\nAxMrZmVkZXJhdGVkLXNpZ25vbi5zeXN0ZW0uZ3NlcnZpY2VhY2NvdW50LmNvbTAe\nFw0xNzA4MDUxMTQzMzRaFw0xNzA4MDgxMjEzMzRaMDYxNDAyBgNVBAMTK2ZlZGVy\nYXRlZC1zaWdub24uc3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5jb20wggEiMA0GCSqG\nSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDA4q0yksIZ/TuBNpMWDpC6JE0aZShasb62\nJJNsMXrqqer/0dMS3I/XRYP03Dw1bOdpKhFIJdTGm6+g9GAXH6TH12Q0271ES9++\naXXkW1l4L2w8NWkADRT45eZFP7X8Tr0Sn8cPTA6rjSWgQ4pzmlBrtIu72s0hpdWE\n3fMvGYdiOBTC48wnkmvEuk0mTjJPjstDEfvZU+G/4oAg6BEbWG7uQ2a/qPRPu+IG\nWS7CpblriSVcM892cFXMz80H87V33PCTbh97CuZkGL3B9tw/PVe/LEIsqCyAFVfQ\nAZjbG2G9Ui9PU5pPO+dxzgEKUNmVc2WhB7XIFgI+c/sN+7f+x9jtAgMBAAGjODA2\nMAwGA1UdEwEB/wQCMAAwDgYDVR0PAQH/BAQDAgeAMBYGA1UdJQEB/wQMMAoGCCsG\nAQUFBwMCMA0GCSqGSIb3DQEBBQUAA4IBAQATA5N/c2WwM1Qk3AbnTsSTNdlQeeox\nCruvHYbtXFvg8o8W+3DWCkFzpuFSKR2c+bhi5urdqMEc3VSXlDnDXslxCIqheVOz\nhWgN+yqHIK/qh9EhOO7z+U72J1zUGCpkC/Szw3w+nkokejfSiLorN9UCAFGcNukT\ncxCCwGe7TyNFbWTR5PhEqJvvYCLbf2Ldd7Q6gkl2OMHGlOdVBEApdHQO6nMwoiHl\nf+nzlSTGOC4KfhIwpPNKibLOjHcRN5ePGHaTNZbrEXoQVZ1oaYwklPLUs6iE2pGC\nvEAIWLVAHOzjQNfFMpMa6MzGgA8wQZs4RgAvyPCHTEMKq6eoi70OsC+a\n-----END CERTIFICATE-----\n"),
	"2307d906764ed4557bab909b5b10b7f457a0964b": []byte("-----BEGIN CERTIFICATE-----\nMIIDJjCCAg6gAwIBAgIIe9gOW3Tf6pEwDQYJKoZIhvcNAQEFBQAwNjE0MDIGA1UE\nAxMrZmVkZXJhdGVkLXNpZ25vbi5zeXN0ZW0uZ3NlcnZpY2VhY2NvdW50LmNvbTAe\nFw0xNzA4MDMxMTQzMzRaFw0xNzA4MDYxMjEzMzRaMDYxNDAyBgNVBAMTK2ZlZGVy\nYXRlZC1zaWdub24uc3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5jb20wggEiMA0GCSqG\nSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCvFNl+fOGSyMbuFbDDWLgiClB6P5Seij3s\njsrkR4jHjgq0YQlts1Yid0B8K2M3nW5D6KcTIVjKfb4kcpIlw1XJuyY37EV3dJvp\n6a8751VUFqK5MqeXw4wbAfdSeJJNq1gqjvk04ckruWb+e1ByBcDJ9ne1kFNH9kM1\nc89z/W+MH8prsrbs4IZ9XQ3e3sPR/27X3+RfEku5GojKX3MTymMnqsAO9Pa3z+ur\ndbNZhyrtDlvXVU+pQCBMTV3Em/x8tx1Q8bx61UvH/yuDRQC+xtHByciJ0tT7tU3U\nxL8X9pEMxkrvb0ip37R4KTBp+TMFCa2BjUhFZYwjhtNhDQA/LZmJAgMBAAGjODA2\nMAwGA1UdEwEB/wQCMAAwDgYDVR0PAQH/BAQDAgeAMBYGA1UdJQEB/wQMMAoGCCsG\nAQUFBwMCMA0GCSqGSIb3DQEBBQUAA4IBAQA28cXgg4GpfkZqnQPzb/79alAy0/fh\np4PD0pd+h8xnNMWFOm9EEQAUmTg/4XIlbdDO1e/G2VTeC9c2FvcGI0RGqLZXxpZo\nTbBqvu/EnR6VVRuT4rGlGVNbC0TPSZqRfohCVA74FE4UE8U2wN3Vi2Vci8QiPSEu\nGIqJc8N0XdGflG9buu7jUCrEcmWQFUHxM6WUSlMDSoCzYC/4xjBKCsK9SskiR+GF\ndEA2WrjNous3ohDzKlrKWWMKW41zbTV2iZyNkr95tht6wnu1gNwTq4kuDMql6LVu\ngW5N93/j2jHZGJROMO/Kqd3qzPd+SRTpj7uwX4XqkW8kBDlyyP+xWPnA\n-----END CERTIFICATE-----\n"),
}

var googleAccountIdToDiary map[string]string = map[string]string{}

func main() {
	// ...
	http.HandleFunc("/diary", func(w http.ResponseWriter, req *http.Request) {
		jwtString, err := req.Cookie("google_id_token")
		if err != nil {
			http.Error(w, "Missing google_id_token", 400)
			return
		}
		var claims jwt.StandardClaims
		_, err = jwt.ParseWithClaims(jwtString.Value, &claims, func(token *jwt.Token) (interface{}, error) {
			kid, ok := token.Header["kid"]
			if !ok {
				return nil, errors.New("no kid in token")
			}
			kidString, ok := kid.(string)
			if !ok {
				return nil, errors.New("kid is not string")
			}
			keyPemBytes, ok := googlePublicKeys[kidString]
			if !ok {
				return nil, errors.New("unknown key")
			}
			pubKey, err := jwt.ParseRSAPublicKeyFromPEM(keyPemBytes)
			if err != nil {
				return nil, err
			}
			return pubKey, nil
		})
		if err != nil {
			http.Error(w, "Could not parse/validate google_id_token", 400)
			return
		}
		googleAccountId := claims.Subject
		switch req.Method {
		case "GET":
			w.Write([]byte(googleAccountIdToDiary[googleAccountId]))
		case "PUT":
			reqBodyString, err := ioutil.ReadAll(req.Body)
			if err != nil {
				http.Error(w, "Could not read body", 400)
			}
			googleAccountIdToDiary[googleAccountId] = string(reqBodyString)
		default:
			http.Error(w, "Unsupported method", 400)
		}
	})
	http.ListenAndServe(":" + port, nil)
}
```
