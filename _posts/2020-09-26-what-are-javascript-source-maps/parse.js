const { readFileSync } = require('fs');
const { SourceMapConsumer } = require('source-map');
(async () => {
  await SourceMapConsumer.with(
    JSON.parse(readFileSync('./generated.js.map')), 
    null, 
    consumer => consumer.eachMapping(console.log)
  );
})();