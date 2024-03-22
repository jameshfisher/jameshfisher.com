import blogroll from "./blogroll.js";

export const data = {
  layout: "layouts/minimal",
  author: "jim",
  title: "Blogroll",
};

export function render(data) {
  return `<p>
  This blogroll is also available as <a href="/blogroll.xml">an OPML file</a>,
  which is accepted by many RSS readers.
</p>

<table>
  <thead>
    <tr>
      <th>Blog</th>
      <th>RSS</th>
      <th>Author</th>
    </tr>
  </thead>
  <tbody>
    ${blogroll.map(
      (blog) => `<tr>
    <td><a href="${blog.htmlUrl}">${blog.title}</a></td>
    <td>${blog.xmlUrl ? `<a href="${blog.xmlUrl}">Here</a>` : "Nope"}</td>
    <td>${blog.author}</td>
  </tr>`,
    ).join("\n")}
  </tbody>
</table>
`;
}
