export const data = {
  permalink: "sitemap.xml",
};

export function render(data) {
  const allPagesByUrl = [...data.collections.all];
  allPagesByUrl.sort((p1, p2) => p1.url.localeCompare(p2.url));

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
  http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPagesByUrl
    .map(
      (page) => `<url>
  <loc>https://jameshfisher.com${page.url}</loc>
  <lastmod>${page.date.toISOString()}</lastmod>
  </url>`,
    )
    .join("\n")}
</urlset>
`;
}
