---
title: "How to fix 'Activating bundler (< 2) failed' error in your jekyll build"
tags: ["programming"]
---

This site is built using Jekyll,
and deployed on Netlify.
In 2019, the build mysteriously started breaking!
Here's the log:

```
12:03:42 AM: Build ready to start
12:03:43 AM: build-image version: a5eae1c6c4e364927c6341a4e1b48c08b677fbea
12:03:43 AM: buildbot version: 4e1a9212685550ba2662a8f218ac42f6f9fa20ee
12:03:43 AM: Fetching cached dependencies
12:03:44 AM: Starting to download cache of 151.3MB
12:03:44 AM: Finished downloading cache in 1.145747864s
12:03:44 AM: Starting to extract cache
12:03:47 AM: Finished extracting cache in 2.901029953s
12:03:48 AM: Finished fetching cache in 4.398583743s
12:03:48 AM: Starting to prepare the repo for build
12:03:48 AM: Preparing Git Reference refs/heads/master
12:03:49 AM: Starting build script
12:03:49 AM: Installing dependencies
12:03:50 AM: Started restoring cached node version
12:03:51 AM: Finished restoring cached node version
12:03:52 AM: v8.15.0 is already installed.
12:03:52 AM: Now using node v8.15.0 (npm v6.4.1)
12:03:53 AM: Required ruby-2.3.3 is not installed.
12:03:53 AM: To install do: 'rvm install "ruby-2.3.3"'
12:03:53 AM: Attempting ruby version 2.3.3, read from .ruby-version file
12:03:53 AM: Started restoring cached ruby version
12:03:53 AM: Finished restoring cached ruby version
12:03:55 AM: Using ruby version 2.3.3
12:04:02 AM: Successfully installed bundler-2.0.1
12:04:02 AM: Parsing documentation for bundler-2.0.1
12:04:02 AM: Installing ri documentation for bundler-2.0.1
12:04:02 AM: Done installing documentation for bundler after 6 seconds
12:04:02 AM: 1 gem installed
12:04:02 AM: Using PHP version 5.6
12:04:02 AM: Started restoring cached ruby gems
12:04:02 AM: Finished restoring cached ruby gems
12:04:02 AM: Started restoring cached go cache
12:04:02 AM: Finished restoring cached go cache
12:04:02 AM: unset GOOS;
12:04:02 AM: unset GOARCH;
12:04:02 AM: export GOROOT='/opt/buildhome/.gimme/versions/go1.10.linux.amd64';
12:04:02 AM: export PATH="/opt/buildhome/.gimme/versions/go1.10.linux.amd64/bin:${PATH}";
12:04:02 AM: go version >&2;
12:04:02 AM: export GIMME_ENV='/opt/buildhome/.gimme/env/go1.10.linux.amd64.env';
12:04:02 AM: go version go1.10 linux/amd64
12:04:02 AM: Installing missing commands
12:04:02 AM: Verify run directory
12:04:02 AM: Executing user command: jekyll build
12:04:02 AM: Activating bundler (< 2) failed:
12:04:02 AM: Could not find 'bundler' (< 2) - did find: [bundler-2.0.1]
12:04:02 AM: Checked in 'GEM_PATH=/opt/buildhome/.rvm/gems/ruby-2.3.3:/opt/buildhome/.rvm/gems/ruby-2.3.3@global', execute `gem env` for more information
12:04:02 AM: To install the version of bundler this project requires, run `gem install bundler -v '< 2'`
12:04:02 AM: Caching artifacts
12:04:02 AM: Started saving ruby gems
12:04:02 AM: Finished saving ruby gems
12:04:03 AM: Started saving pip cache
12:04:03 AM: Finished saving pip cache
12:04:03 AM: Started saving emacs cask dependencies
12:04:03 AM: Finished saving emacs cask dependencies
12:04:03 AM: Started saving maven dependencies
12:04:03 AM: Finished saving maven dependencies
12:04:03 AM: Started saving boot dependencies
12:04:03 AM: Finished saving boot dependencies
12:04:03 AM: Started saving go dependencies
12:04:03 AM: Finished saving go dependencies
12:04:03 AM: Error running command: Build script returned non-zero exit code: 42
12:04:03 AM: Failing build: Failed to build site
12:04:03 AM: failed during stage 'building site': Build script returned non-zero exit code: 42
12:04:03 AM: Finished processing build request in 19.768156763s
```

Since the last successful build,
`Successfully installed bundler-1.17.3`
changed to `Successfully installed bundler-2.0.1`.
[Netlify's build image doesn't specify a version](https://github.com/netlify/build-image/blob/84aca9ba39e0ee86ba194760fbfc51a808f62543/Dockerfile#L240-L242),
and [Bundler just released a new major version, 2.0.1](https://rubygems.org/gems/bundler/versions/2.0.1).

So Bundler 2 doesn't work for my site.
But why?
The fix was to remove the last two lines from `Gemfile.lock`:

```
$ tail -2 Gemfile.lock
BUNDLED WITH
   1.14.6
```

Apparently, Bundler 2 fails if it finds a `Gemfile.lock` which was bundled with version 1.
Despite claiming to be backwards compatible.
(In which case, why the new major version number?)