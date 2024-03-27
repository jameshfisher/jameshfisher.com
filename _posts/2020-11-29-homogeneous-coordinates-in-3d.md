---
title: Homogeneous coordinates in 3D
tags:
  - mathematics
  - programming
  - js
  - graphics
---

Here is an animation of a house.
It's special because it's drawn using my very own ✨homogeneous coordinates✨ library.

<canvas id="anim" style="background-color: rgb(255,255,200); width: 400px; display: block; margin: 0 auto;"></canvas>

In [my previous post, I showed homogeneous coordinates in 2D](/2020/11/28/homogeneous-coordinates-in-2d-from-scratch/).
I can geometrically visualize homogeneous coordinates for 2D space -
the hard part being the projection matrix that warps a 3D space of homogeneous coordinates
to create a 1D projection of a 2D space.
But my brain melts when trying to visualize how a 4D projection matrix 
warps 4D space to create a 2D projection of a 3D space.
Therefore, for this 3D animation, I reasoned entirely by analogy with my 2D implementation.
That said, the conversion from 2D to 3D was clean and mechanical.

Here are the matrices I derived for rotation, scaling, translation and projection.
They are in column-major format,
which is the only sensible format,
and the one used by [my 5-line matrix library](/2020/11/27/a-matrix-library-in-5-lines-of-code/).

```js
const rotateZHom3d = a => [
  [ Math.cos(a), Math.sin(a), 0, 0], // x
  [-Math.sin(a), Math.cos(a), 0, 0], // y
  [0,            0,           1, 0], // z is unchanged
  [0,            0,           0, 1], // w is unchanged
];
const rotateXHom3d = a => [
  [1,            0,           0, 0], // x is unchanged
  [0,  Math.cos(a), Math.sin(a), 0], // y
  [0, -Math.sin(a), Math.cos(a), 0], // z
  [0,            0,           0, 1], // w is unchanged
];
const rotateYHom3d = a => [
  [ Math.cos(a), 0, Math.sin(a), 0],
  [0,            1, 0,           0],  // y is unchanged
  [-Math.sin(a), 0, Math.cos(a), 0],
  [0,            0, 0,           1],  // w is unchanged
];
const scaleSepHom3d = (s) => [ 
  [s[0],     0,    0, 0],  // x 
  [0,    s[1],     0, 0],  // y
  [0,        0, s[2], 0],  // z
  [0,        0,    0, 1],  // w
];
const scaleHom3d = s => scaleSepHom3d([s,s,s]);
const translateHom3d = v => [
  [   1,    0,    0, 0],  // x
  [   0,    1,    0, 0],  // y
  [   0,    0,    1, 0],  // z
  [v[0], v[1], v[2], 1],  // w
];

// Projects onto the z=1 plane from the origin
const projectHom3d = [
  [1,0,0,0], // x is unchanged
  [0,1,0,0], // y is unchanged
  // Points scaled down in proportion with their distance from the projection plane
  [0,0,1,1], 
  // A point's w-factor is IGNORED. For projection, we're only interested in _direction_ from the origin
  [0,0,0,0],
];
```

<script>
  const canvasEl = document.getElementById("anim");
  canvasEl.width = 800;
  canvasEl.height = 500;
  const ctx = canvasEl.getContext("2d");

  const drawLine = line => {
    ctx.beginPath();
    ctx.moveTo(line[0][0], line[0][1]);
    for (const p of line.slice(1)) {
      ctx.lineTo(p[0], p[1]);
    }
    ctx.lineJoin = "bevel";
    ctx.lineWidth = 4;
    ctx.stroke();
  };

  const zipWith = (f, a, b) => a.map((k, i) => f(k, b[i]));

  const vecScale = (n, v) => v.map(c => n*c);
  const vecAdd = (v1, v2) => zipWith((c1,c2)=>c1+c2, v1, v2);
  const matApply = (mat, vec) => zipWith(vecScale, vec, mat).reduce(vecAdd);
  const matMul = (m2, m1) => m1.map(v => matApply(m2,v));

  // Convenience fns
  const matSeq = ms => ms.slice(1).reduce((acc,m) => matMul(m,acc), ms[0]);
  const matApplyToLine = (m, s) => s.map(p => matApply(m, p));
  const matApplyToObject = (m, o) => o.map(f => matApplyToLine(m, f));

  // Done with generic matrix lib
  // Now our 3D homogeneous coordinates lib

  const rotateZHom3d = a => [
    [ Math.cos(a), Math.sin(a), 0, 0], // x
    [-Math.sin(a), Math.cos(a), 0, 0], // y
    [0,            0,           1, 0], // z is unchanged
    [0,            0,           0, 1], // w is unchanged
  ];
  const rotateXHom3d = a => [
    [1,            0,           0, 0], // x is unchanged
    [0,  Math.cos(a), Math.sin(a), 0], // y
    [0, -Math.sin(a), Math.cos(a), 0], // z
    [0,            0,           0, 1], // w is unchanged
  ];
  const rotateYHom3d = a => [
    [ Math.cos(a), 0, Math.sin(a), 0],
    [0,            1, 0,           0],  // y is unchanged
    [-Math.sin(a), 0, Math.cos(a), 0],
    [0,            0, 0,           1],  // w is unchanged
  ];
  const scaleSepHom3d = (s) => [ 
    [s[0],     0,    0, 0],  // x 
    [0,    s[1],     0, 0],  // y
    [0,        0, s[2], 0],  // z
    [0,        0,    0, 1],  // w
  ];
  const scaleHom3d = s => scaleSepHom3d([s,s,s]);
  const translateHom3d = v => [
    [   1,    0,    0, 0],  // x
    [   0,    1,    0, 0],  // y
    [   0,    0,    1, 0],  // z
    [v[0], v[1], v[2], 1],  // w
  ];

  // Projects onto the z=1 plane from the origin
  const projectHom3d = [
    [1,0,0,0], // x is unchanged
    [0,1,0,0], // y is unchanged
    // Points scaled down in proportion with their distance from the projection plane
    [0,0,1,1], 
    // A point's w-factor is IGNORED. For projection, we're only interested in _direction_ from the origin
    [0,0,0,0],
  ];

  const unHom3d = ([x,y,z,w]) => [x/w, y/w, z/w];

  const drawLineHom3d = line => drawLine(line.map(unHom3d));
  const drawObjectHom3d = object => object.forEach(drawLineHom3d);

  const unitSquareXYHom3d = [
    [-0.5, -0.5, 0, 1],
    [ 0.5, -0.5, 0, 1],
    [ 0.5,  0.5, 0, 1],
    [-0.5,  0.5, 0, 1],
    [-0.5, -0.5, 0, 1],
  ];

  const unitCubeFrontLineHom3d = [
    [-0.5, -0.5, 0.5, 1],
    [ 0.5, -0.5, 0.5, 1],
    [ 0.5,  0.5, 0.5, 1],
    [-0.5,  0.5, 0.5, 1],
  ];

  fourSides = side => [
    side,
    matApplyToLine(rotateYHom3d(Math.PI* 1/2), side),
    matApplyToLine(rotateYHom3d(Math.PI     ), side),
    matApplyToLine(rotateYHom3d(Math.PI* 3/2), side),
  ];

  const unitCubeObjectHom3d = fourSides(unitCubeFrontLineHom3d);

  const unitPyramidLineHom3d = [
    [-0.5, -0.5, -0.5, 1],
    [   0,  0.5,    0, 1],
  ];
  const unitPyramidObjectHom3d = fourSides(unitPyramidLineHom3d);

  const houseBody = matApplyToObject(scaleSepHom3d([10, 5, 5]), unitCubeObjectHom3d);
  const houseRoof = matApplyToObject(matSeq([scaleSepHom3d([10, 3, 5]), translateHom3d([0, 4, 0])]), unitPyramidObjectHom3d);
  const housePorch = matApplyToObject(matSeq([scaleSepHom3d([2, 3, 1]), translateHom3d([0, -1, -3])]), unitCubeObjectHom3d);
  const houseChimney = matApplyToObject(matSeq([scaleSepHom3d([1,2,1]), translateHom3d([-3, 4, 0])]), unitCubeObjectHom3d);
  const houseWindow1 = matApplyToObject(matSeq([scaleSepHom3d([1,2,1]), translateHom3d([-3, 0, -2.5])]), [unitSquareXYHom3d]);
  const houseWindow2 = matApplyToObject(matSeq([scaleSepHom3d([1,2,1]), translateHom3d([ 3, 0, -2.5])]), [unitSquareXYHom3d]);
  const houseSceneSpace = [...houseBody, ...houseRoof, ...housePorch, ...houseChimney, ...houseWindow1, ...houseWindow2];

  const garageBody = matApplyToObject(scaleSepHom3d([3, 3, 5]), unitCubeObjectHom3d);
  const garageRoof = matApplyToObject(matSeq([scaleSepHom3d([3, 1, 5]), translateHom3d([0,2,0])]), unitPyramidObjectHom3d);
  const garage = [...garageBody, ...garageRoof];
  const garageSceneSpace = matApplyToObject(matSeq([rotateYHom3d(Math.PI/8), translateHom3d([10, -1, -3])]), garage);

  const scene = [...houseSceneSpace, ...garageSceneSpace];

  const viewProjectionMatrix = matSeq([
    projectHom3d,
    scaleHom3d(600),
    scaleSepHom3d([1, -1, 1]),  // I designed for y-up, but canvas is y-down
    translateHom3d([canvasEl.width/2, canvasEl.height/2, 0]),  // move origin to center of canvas
  ]);

  const onFrame = ts => {
    const spinAndOrbitAnimMatrix = matSeq([
      rotateYHom3d(ts / 500),        // spinning
      translateHom3d([10, 0, 0]),   // spinning off to the right
      rotateYHom3d(ts / 2000),     // spinning, orbiting the origin
      translateHom3d([0, 0, 30]),     // spinning, orbiting the origin, beyond z=1 projection plane
    ]);
  
    const sceneWorldSpaceHom3d = matApplyToObject(spinAndOrbitAnimMatrix, scene);

    canvasEl.width = canvasEl.width; // clear

    ctx.strokeStyle = 'black';
    drawObjectHom3d(matApplyToObject(viewProjectionMatrix, sceneWorldSpaceHom3d));

    window.setTimeout(() => window.requestAnimationFrame(onFrame), 20);
  };

  window.requestAnimationFrame(onFrame);
</script>
