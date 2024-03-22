import { XmlEntities } from "html-entities";

const entities = new XmlEntities();

export const data = {
  permalink: "feed.xml",
  eleventyExcludeFromCollections: true,
};

export function render(data) {
  const postsByDateDesc = [...data.collections.posts];
  postsByDateDesc.sort((p1, p2) => p2.date - p1.date);

  const mostRecentPosts = postsByDateDesc.slice(0, 10);

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <link href="https://jameshfisher.com/feed.xml" rel="self" type="application/atom+xml"/>
  <link href="https://jameshfisher.com/" rel="alternate" type="text/html"/>
  <updated>${new Date(
    Math.max(...data.collections.posts.map((post) => post.date)),
  ).toISOString()}</updated>
  <id>https://jameshfisher.com/feed.xml</id>
  <title type="html">Jim Fisher’s blog</title>
  <author>
    <name>Jim Fisher</name>
  </author>
  ${mostRecentPosts
    .map(
      (post) => `<entry>
    <title>${entities.encode(post.data.title)}</title>
    <link href="https://jameshfisher.com${post.url}"/>
    <updated>${post.date.toISOString()}</updated>
    <id>https://jameshfisher.com${post.url}</id>
    <content type="html">${entities.encode(post.templateContent)}</content>
  </entry>`,
    )
    .join("\n")}
</feed>
`;
}
