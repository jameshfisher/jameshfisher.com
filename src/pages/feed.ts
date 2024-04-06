import { XmlEntities } from "html-entities";
import { liquidMarkdownToHtml } from "../liquidMarkdown";
import { sortByDate } from "../sortByDate";
import type { Post } from "../types";

const entities = new XmlEntities();

export function renderFeedXml(posts: Post[]) {
  const postsByDateDesc = sortByDate(posts);

  const mostRecentPosts = postsByDateDesc.slice(0, 10);

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <link href="https://jameshfisher.com/feed.xml" rel="self" type="application/atom+xml"/>
  <link href="https://jameshfisher.com/" rel="alternate" type="text/html"/>
  <updated>${new Date(mostRecentPosts[0]!.date).toISOString()}</updated>
  <id>https://jameshfisher.com/feed.xml</id>
  <title type="html">Jim Fisher’s blog</title>
  <author>
    <name>Jim Fisher</name>
  </author>
  ${mostRecentPosts
    .map(
      (post) => `<entry>
    <title>${entities.encode(post.frontmatter.title)}</title>
    <link href="https://jameshfisher.com${post.page.url}"/>
    <updated>${post.date.toISOString()}</updated>
    <id>https://jameshfisher.com${post.page.url}</id>
    <content type="html">${entities.encode(
      liquidMarkdownToHtml(post.markdownContent)
    )}</content>
  </entry>`
    )
    .join("\n")}
</feed>
`;
}
