---
title: How do I fetch a server's SSL certificate using `openssl`?
justification: >-
  I said I'd learn SSL. I'm doing this by going through all the `openssl`
  commands. Here's the `s_client` command.
tags:
  - openssl
  - tls
  - certificates
  - security
  - cli
  - programming
taggedAt: '2024-03-26'
summary: >-
  Use the `openssl s_client` command to fetch a server's SSL certificate chain,
  including the root certificate.
---

The `openssl` tool has a command `s_client` which is a general SSL client; i.e. it connects to an SSL-enabled server. HTTPS servers run an SSL on TCP port 443. We can use `s_client` to connect to them. Here's an example of connecting to the HTTPS server on `google.com` and getting the root page. In the course of this, the process prints the "certificate chain" to standard out.

```
$ openssl s_client -showcerts -connect google.com:443
CONNECTED(00000003)
depth=2 /C=US/O=GeoTrust Inc./CN=GeoTrust Global CA
verify error:num=20:unable to get local issuer certificate
verify return:0
---
Certificate chain
 0 s:/C=US/ST=California/L=Mountain View/O=Google Inc/CN=*.google.com
   i:/C=US/O=Google Inc/CN=Google Internet Authority G2
-----BEGIN CERTIFICATE-----
MIIH4jCCBsqgAwIBAgIIMfyNK/Ybs1gwDQYJKoZIhvcNAQELBQAwSTELMAkGA1UE
BhMCVVMxEzARBgNVBAoTCkdvb2dsZSBJbmMxJTAjBgNVBAMTHEdvb2dsZSBJbnRl
cm5ldCBBdXRob3JpdHkgRzIwHhcNMTcwMjIyMDkxMjI3WhcNMTcwNTE3MDg1NzAw
WjBmMQswCQYDVQQGEwJVUzETMBEGA1UECAwKQ2FsaWZvcm5pYTEWMBQGA1UEBwwN
TW91bnRhaW4gVmlldzETMBEGA1UECgwKR29vZ2xlIEluYzEVMBMGA1UEAwwMKi5n
b29nbGUuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxKa6Uzbw
AQVYojezXSdHAzFeX9+Jv0LKIuOFZ1IIGdpi5TyHptYnKilwcAGYQ8PVsnjHOEWB
ftQ+GJgHG0lgbCE3XDLCMHJ8dwS30GZteazvhZC9ogVSN7/t99ls7UBQlvtcOeum
cmbi3guV4dHpKuZiz6gXh40pdNeH6tL6PhSq+3hwmPCT4kO/qYKT/bT6nwAhbG9z
Plz2tHNx6xlMgpBMNVRnOGjIGfvz1HAzY/qba6egwb4vxH2BgsO7kg/jE4xBwNYe
UtEGPLS46VlJtRA2hMxbjWfnNJJ/en/i/CPAf2ijDcCfadHTFA7RdLieNKY1BDMD
XfufiQQXhH9qfQIDAQABo4IErzCCBKswHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsG
AQUFBwMCMIIDewYDVR0RBIIDcjCCA26CDCouZ29vZ2xlLmNvbYINKi5hbmRyb2lk
LmNvbYIWKi5hcHBlbmdpbmUuZ29vZ2xlLmNvbYISKi5jbG91ZC5nb29nbGUuY29t
gg4qLmdjcC5ndnQyLmNvbYIWKi5nb29nbGUtYW5hbHl0aWNzLmNvbYILKi5nb29n
bGUuY2GCCyouZ29vZ2xlLmNsgg4qLmdvb2dsZS5jby5pboIOKi5nb29nbGUuY28u
anCCDiouZ29vZ2xlLmNvLnVrgg8qLmdvb2dsZS5jb20uYXKCDyouZ29vZ2xlLmNv
bS5hdYIPKi5nb29nbGUuY29tLmJygg8qLmdvb2dsZS5jb20uY2+CDyouZ29vZ2xl
LmNvbS5teIIPKi5nb29nbGUuY29tLnRygg8qLmdvb2dsZS5jb20udm6CCyouZ29v
Z2xlLmRlggsqLmdvb2dsZS5lc4ILKi5nb29nbGUuZnKCCyouZ29vZ2xlLmh1ggsq
Lmdvb2dsZS5pdIILKi5nb29nbGUubmyCCyouZ29vZ2xlLnBsggsqLmdvb2dsZS5w
dIISKi5nb29nbGVhZGFwaXMuY29tgg8qLmdvb2dsZWFwaXMuY26CFCouZ29vZ2xl
Y29tbWVyY2UuY29tghEqLmdvb2dsZXZpZGVvLmNvbYIMKi5nc3RhdGljLmNugg0q
LmdzdGF0aWMuY29tggoqLmd2dDEuY29tggoqLmd2dDIuY29tghQqLm1ldHJpYy5n
c3RhdGljLmNvbYIMKi51cmNoaW4uY29tghAqLnVybC5nb29nbGUuY29tghYqLnlv
dXR1YmUtbm9jb29raWUuY29tgg0qLnlvdXR1YmUuY29tghYqLnlvdXR1YmVlZHVj
YXRpb24uY29tggsqLnl0aW1nLmNvbYIaYW5kcm9pZC5jbGllbnRzLmdvb2dsZS5j
b22CC2FuZHJvaWQuY29tghtkZXZlbG9wZXIuYW5kcm9pZC5nb29nbGUuY26CBGcu
Y2+CBmdvby5nbIIUZ29vZ2xlLWFuYWx5dGljcy5jb22CCmdvb2dsZS5jb22CEmdv
b2dsZWNvbW1lcmNlLmNvbYIKdXJjaGluLmNvbYIKd3d3Lmdvby5nbIIIeW91dHUu
YmWCC3lvdXR1YmUuY29tghR5b3V0dWJlZWR1Y2F0aW9uLmNvbTBoBggrBgEFBQcB
AQRcMFowKwYIKwYBBQUHMAKGH2h0dHA6Ly9wa2kuZ29vZ2xlLmNvbS9HSUFHMi5j
cnQwKwYIKwYBBQUHMAGGH2h0dHA6Ly9jbGllbnRzMS5nb29nbGUuY29tL29jc3Aw
HQYDVR0OBBYEFOsnCPaT5ZLy3gb9H5qJn/bkl1EwMAwGA1UdEwEB/wQCMAAwHwYD
VR0jBBgwFoAUSt0GFhu89mi1dvWBtrtiGrpagS8wIQYDVR0gBBowGDAMBgorBgEE
AdZ5AgUBMAgGBmeBDAECAjAwBgNVHR8EKTAnMCWgI6Ahhh9odHRwOi8vcGtpLmdv
b2dsZS5jb20vR0lBRzIuY3JsMA0GCSqGSIb3DQEBCwUAA4IBAQAVb1pRqPRZMOH3
nXxzt1LHbKqrs2S7GbhIIEx8VlLk1b97iZa7XeNL/2eMiYhtIKR17yN/3TD+fwVK
mvFmsVWi1HmdSJ8IuZ1d+Y2T/0C0w9OhRKTzQfsGs/xieiJwvlPEEGRxXuN7oq8M
i+HCJGwwNVba5f3dd0HtT6bZtjvyyZo6HjWR1QZo8Zttn72BoVFFtRzyUm2Z+/wh
7LdztJ1lk5YjzF0InsAHGBHaCV8K1fDxwXEFqq6Vf03T1jXr0eOg6NGcvB7Z/Pcm
XFxmRD2iqUiWhJ+gjOBdC/7w5Dv4kJwfLb4pV9py/8bLI/zKiKdX10QcfEYD4FUg
lAQIiB2z
-----END CERTIFICATE-----
 1 s:/C=US/O=Google Inc/CN=Google Internet Authority G2
   i:/C=US/O=GeoTrust Inc./CN=GeoTrust Global CA
-----BEGIN CERTIFICATE-----
MIID8DCCAtigAwIBAgIDAjqSMA0GCSqGSIb3DQEBCwUAMEIxCzAJBgNVBAYTAlVT
MRYwFAYDVQQKEw1HZW9UcnVzdCBJbmMuMRswGQYDVQQDExJHZW9UcnVzdCBHbG9i
YWwgQ0EwHhcNMTUwNDAxMDAwMDAwWhcNMTcxMjMxMjM1OTU5WjBJMQswCQYDVQQG
EwJVUzETMBEGA1UEChMKR29vZ2xlIEluYzElMCMGA1UEAxMcR29vZ2xlIEludGVy
bmV0IEF1dGhvcml0eSBHMjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB
AJwqBHdc2FCROgajguDYUEi8iT/xGXAaiEZ+4I/F8YnOIe5a/mENtzJEiaB0C1NP
VaTOgmKV7utZX8bhBYASxF6UP7xbSDj0U/ck5vuR6RXEz/RTDfRK/J9U3n2+oGtv
h8DQUB8oMANA2ghzUWx//zo8pzcGjr1LEQTrfSTe5vn8MXH7lNVg8y5Kr0LSy+rE
ahqyzFPdFUuLH8gZYR/Nnag+YyuENWllhMgZxUYi+FOVvuOAShDGKuy6lyARxzmZ
EASg8GF6lSWMTlJ14rbtCMoU/M4iarNOz0YDl5cDfsCx3nuvRTPPuj5xt970JSXC
DTWJnZ37DhF5iR43xa+OcmkCAwEAAaOB5zCB5DAfBgNVHSMEGDAWgBTAephojYn7
qwVkDBF9qn1luMrMTjAdBgNVHQ4EFgQUSt0GFhu89mi1dvWBtrtiGrpagS8wDgYD
VR0PAQH/BAQDAgEGMC4GCCsGAQUFBwEBBCIwIDAeBggrBgEFBQcwAYYSaHR0cDov
L2cuc3ltY2QuY29tMBIGA1UdEwEB/wQIMAYBAf8CAQAwNQYDVR0fBC4wLDAqoCig
JoYkaHR0cDovL2cuc3ltY2IuY29tL2NybHMvZ3RnbG9iYWwuY3JsMBcGA1UdIAQQ
MA4wDAYKKwYBBAHWeQIFATANBgkqhkiG9w0BAQsFAAOCAQEACE4Ep4B/EBZDXgKt
10KA9LCO0q6z6xF9kIQYfeeQFftJf6iZBZG7esnWPDcYCZq2x5IgBzUzCeQoY3IN
tOAynIeYxBt2iWfBUFiwE6oTGhsypb7qEZVMSGNJ6ZldIDfM/ippURaVS6neSYLA
EHD0LPPsvCQk0E6spdleHm2SwaesSDWB+eXknGVpzYekQVA/LlelkVESWA6MCaGs
eqQSpSfzmhCXfVUDBvdmWF9fZOGrXW2lOUh1mEwpWjqN0yvKnFUEv/TmFNWArCbt
F4mmk2xcpMy48GaOZON9muIAs0nH5Aqq3VuDx3CQRk6+0NtZlmwu9RY23nHMAcIS
wSHGFg==
-----END CERTIFICATE-----
 2 s:/C=US/O=GeoTrust Inc./CN=GeoTrust Global CA
   i:/C=US/O=Equifax/OU=Equifax Secure Certificate Authority
-----BEGIN CERTIFICATE-----
MIIDfTCCAuagAwIBAgIDErvmMA0GCSqGSIb3DQEBBQUAME4xCzAJBgNVBAYTAlVT
MRAwDgYDVQQKEwdFcXVpZmF4MS0wKwYDVQQLEyRFcXVpZmF4IFNlY3VyZSBDZXJ0
aWZpY2F0ZSBBdXRob3JpdHkwHhcNMDIwNTIxMDQwMDAwWhcNMTgwODIxMDQwMDAw
WjBCMQswCQYDVQQGEwJVUzEWMBQGA1UEChMNR2VvVHJ1c3QgSW5jLjEbMBkGA1UE
AxMSR2VvVHJ1c3QgR2xvYmFsIENBMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEA2swYYzD99BcjGlZ+W988bDjkcbd4kdS8odhM+KhDtgPpTSEHCIjaWC9m
OSm9BXiLnTjoBbdqfnGk5sRgprDvgOSJKA+eJdbtg/OtppHHmMlCGDUUna2YRpIu
T8rxh0PBFpVXLVDviS2Aelet8u5fa9IAjbkU+BQVNdnARqN7csiRv8lVK83Qlz6c
JmTM386DGXHKTubU1XupGc1V3sjs0l44U+VcT4wt/lAjNvxm5suOpDkZALeVAjmR
Cw7+OC7RHQWa9k0+bw8HHa8sHo9gOeL6NlMTOdReJivbPagUvTLrGAMoUgRx5asz
PeE4uwc2hGKceeoWMPRfwCvocWvk+QIDAQABo4HwMIHtMB8GA1UdIwQYMBaAFEjm
aPkr0rKV10fYIyAQTzOYkJ/UMB0GA1UdDgQWBBTAephojYn7qwVkDBF9qn1luMrM
TjAPBgNVHRMBAf8EBTADAQH/MA4GA1UdDwEB/wQEAwIBBjA6BgNVHR8EMzAxMC+g
LaArhilodHRwOi8vY3JsLmdlb3RydXN0LmNvbS9jcmxzL3NlY3VyZWNhLmNybDBO
BgNVHSAERzBFMEMGBFUdIAAwOzA5BggrBgEFBQcCARYtaHR0cHM6Ly93d3cuZ2Vv
dHJ1c3QuY29tL3Jlc291cmNlcy9yZXBvc2l0b3J5MA0GCSqGSIb3DQEBBQUAA4GB
AHbhEm5OSxYShjAGsoEIz/AIx8dxfmbuwu3UOx//8PDITtZDOLC5MH0Y0FWDomrL
NhGc6Ehmo21/uBPUR/6LWlxz/K7ZGzIZOKuXNBSqltLroxwUCEm2u+WR74M26x1W
b8ravHNjkOR/ez4iyz0H7V84dJzjA1BOoa+Y7mHyhD8S
-----END CERTIFICATE-----
---
Server certificate
subject=/C=US/ST=California/L=Mountain View/O=Google Inc/CN=*.google.com
issuer=/C=US/O=Google Inc/CN=Google Internet Authority G2
---
No client certificate CA names sent
---
SSL handshake has read 4106 bytes and written 456 bytes
---
New, TLSv1/SSLv3, Cipher is AES128-SHA
Server public key is 2048 bit
Secure Renegotiation IS supported
Compression: NONE
Expansion: NONE
SSL-Session:
    Protocol  : TLSv1
    Cipher    : AES128-SHA
    Session-ID: E30F84973480B9EF70FFD2FF09D5BD10C1B2E73BA58F1FB5C0B350E7CFEB1B95
    Session-ID-ctx:
    Master-Key: C4BF518003989BADE52A8A1BF10CCAAAF55EFC5AA87BB61D4B8783D9C5F8C99018C50C369F41448E5141F67941931BF1
    Key-Arg   : None
    Start Time: 1489443924
    Timeout   : 300 (sec)
    Verify return code: 0 (ok)
---
GET /
HTTP/1.0 302 Found
Cache-Control: private
Content-Type: text/html; charset=UTF-8
Location: https://www.google.es/?gfe_rd=cr&ei=VxzHWLm-Kayp8weTqpeICw
Content-Length: 259
Date: Mon, 13 Mar 2017 22:25:27 GMT
Alt-Svc: quic=":443"; ma=2592000; v="36,35,34"

<HTML><HEAD><meta http-equiv="content-type" content="text/html;charset=utf-8">
<TITLE>302 Moved</TITLE></HEAD><BODY>
<H1>302 Moved</H1>
The document has moved
<A HREF="https://www.google.es/?gfe_rd=cr&amp;ei=VxzHWLm-Kayp8weTqpeICw">here</A>.
</BODY></HTML>
read:errno=0
```
