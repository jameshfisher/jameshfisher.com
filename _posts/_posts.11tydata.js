// https://www.11ty.dev/docs/data-template-dir/

module.exports = {
  permalink: "{{ page.date | date: '%Y/%m/%d' }}/{{page.fileSlug}}/index.html",
  layout: "layouts/default",
  justification: "I felt like it.",
  author: "jim"
};

