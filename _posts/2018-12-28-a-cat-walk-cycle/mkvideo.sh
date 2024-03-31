#!/bin/bash
mkdir -p tmp
convert -coalesce -scale 1000% cat.gif tmp/frames%04d.png
cd tmp
cp frames0000.png frames0004.png
cp frames0001.png frames0005.png
cp frames0002.png frames0006.png
cp frames0003.png frames0007.png
cp frames0000.png frames0008.png
cp frames0001.png frames0009.png
cp frames0002.png frames0010.png
cp frames0003.png frames0011.png
cp frames0000.png frames0012.png
cp frames0001.png frames0013.png
cp frames0002.png frames0014.png
cp frames0003.png frames0015.png
cp frames0000.png frames0016.png
cp frames0001.png frames0017.png
cp frames0002.png frames0018.png
cp frames0003.png frames0019.png
cp frames0000.png frames0020.png
cp frames0001.png frames0021.png
cp frames0002.png frames0022.png
cp frames0003.png frames0023.png
cp frames0000.png frames0024.png
cp frames0001.png frames0025.png
cp frames0002.png frames0026.png
cp frames0003.png frames0027.png
cp frames0000.png frames0028.png
cp frames0001.png frames0029.png
cp frames0002.png frames0030.png
cp frames0003.png frames0031.png
cp frames0000.png frames0032.png
cp frames0001.png frames0033.png
cp frames0002.png frames0034.png
cp frames0003.png frames0035.png
ffmpeg -r 5 -i frames%04d.png -y movie.mp4