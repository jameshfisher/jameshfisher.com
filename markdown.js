import markdownIt from "markdown-it";

const markdownItRenderer = markdownIt({
  xhtmlOut: true, // Commonmark compliance
  typographer: true, // Only enabled for 'smartquotes' feature; see https://github.com/markdown-it/markdown-it/issues/730
}).disable("replacements"); // Weird stuff like '(c)' --> &copy;

export const renderInlineMarkdown = (title) =>
  markdownItRenderer.renderInline(title);
