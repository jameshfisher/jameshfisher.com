#!/bin/bash

# source this file from your ~/.bashrc

function blogpost {
  printf -- "---\ntitle: \"$1\"\ntags: []\n---\n\n" > "/Users/jim/dev/jameshfisher/jameshfisher.com/_posts/$(date '+%Y-%m-%d')-$(echo $1 | tr '[:upper:] ' '[:lower:]-' | tr -cd "[:alnum:]-").md"
}

alias jekyllserve="bundle exec jekyll clean && bundle exec jekyll serve --watch --incremental"

alias blog="cd ~/dev/jameshfisher/jameshfisher.com && code -n . && jekyllserve"
