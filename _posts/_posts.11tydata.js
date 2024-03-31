// https://www.11ty.dev/docs/data-template-dir/

// format YYYY/MM/DD, including leading zeros
function formatDate(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, "/");
}

export default {
  filetype: "blogpost",
  permalink: (data) =>
    `/${formatDate(data.page.date)}/${data.page.fileSlug}/index.html`,

  layout: "layouts/default",
  justification: "I felt like it.",
  author: "jim",
};
