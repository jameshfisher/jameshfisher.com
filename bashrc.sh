#!/bin/bash

# source this file from your ~/.bashrc

function blogpost {
  local blogpost_slug=$(echo $1 | tr '[:upper:] ' '[:lower:]-' | tr -cd "[:alnum:]-")
  local blogpost_date=$(date '+%Y-%m-%d')
  local blogpost_dir="${HOME}/dev/jameshfisher/jameshfisher.com/_posts/${blogpost_date}-${blogpost_slug}"
  mkdir -p $blogpost_dir
  printf -- "---\ntitle: \"$1\"\ntags: []\n---\n\n" > "${blogpost_dir}/index.md"
}

alias blog="cd ~/dev/jameshfisher/jameshfisher.com && code -n . && npm run dev"
