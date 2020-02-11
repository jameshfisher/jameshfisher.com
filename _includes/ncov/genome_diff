#!/bin/bash
fetch_genome() {
  curl -s "https://www.ncbi.nlm.nih.gov/sviewer/viewer.cgi?report=fasta&id=$1" \
  | grep -v '^>' | tr -d '\n' | sed 's/\(.\)/\1 /g' > $1
}
fetch_genome $1
fetch_genome $2
wdiff -s -123 $1 $2