const Entities = require('html-entities').XmlEntities;
 
const entities = new Entities();

exports.data = {
  "permalink": "feed.xml",
  "eleventyExcludeFromCollections": true,
};

exports.render = function(data) {
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <link href="https://jameshfisher.com/feed.xml" rel="self" type="application/atom+xml"/>
  <link href="https://jameshfisher.com/" rel="alternate" type="text/html"/>
  <updated>${new Date(Math.max(...data.collections.posts.map(post => post.date))).toISOString() }</updated>
  <id>https://jameshfisher.com/feed.xml</id>
  <title type="html">Jim Fisher’s blog</title>
  <author>
    <name>Jim Fisher</name>
  </author>
  ${ data.collections.posts.map(post => `<entry>
    <title>${ post.data.title }</title>
    <link href="https://jameshfisher.com${ post.url }"/>
    <updated>${ post.date.toISOString() }</updated>
    <id>https://jameshfisher.com${ post.url }</id>
    <content type="html">${ entities.encode(post.templateContent) }</content>
  </entry>`).join('\n') }
</feed>
`;
}

