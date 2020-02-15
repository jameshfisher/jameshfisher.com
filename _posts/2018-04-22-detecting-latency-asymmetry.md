---
title: "Can you detect asymmetric latency?"
draft: true
---

skew = 400
latency = 100

100
      600
      1000 
700

600 = 100 + skew + latency

skew + latency = 500

700 = 1000 + latency - skew
latency - skew = -300

latency + skew = 500
latency - skew = -300
2*latency = 200
latency = 100
skew = 400

assumption: symmetry



skew = 400
latAB = 100
latBA = 50


100
    600
    1000
650

solve assuming symmetry:
lat + skew = 500
lat - skew = -350
2lat = 150
lat = 75
skew = 425


skew = -25

100
    175
    1000
1075

solve:
lat + skew = 75
lat - skew = 75
2lat = 150
lat = 75
