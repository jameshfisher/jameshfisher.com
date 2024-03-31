const { writeFileSync } = require("fs");
const { SourceMapGenerator } = require("source-map");

var map = new SourceMapGenerator({ file: "generated.js" });

map.addMapping({
  generated: { line: 1, column: 1 },
  source: "source.jimscript",
  original: { line: 3, column: 1 },
  name: "main"
});

map.addMapping({
  generated: { line: 2, column: 1 },
  source: "source.jimscript",
  original: { line: 4, column: 1 },
  name: "main"
});

map.addMapping({
  generated: { line: 3, column: 1 },
  source: "source.jimscript",
  original: { line: 5, column: 1 },
  name: "main"
});

map.addMapping({
  generated: { line: 5, column: 1 },
  source: "source.jimscript",
  original: { line: 7, column: 1 },
  name: null
});

writeFileSync("generated.js.map", map.toString());
