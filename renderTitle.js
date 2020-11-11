const markdownIt = require('markdown-it');
const markdownItRenderer = markdownIt({
  xhtmlOut: true, // Commonmark compliance
  typographer: true   // Only enabled for 'smartquotes' feature; see https://github.com/markdown-it/markdown-it/issues/730
}).disable('replacements');  // Weird stuff like '(c)' --> &copy;
module.exports = (title) => markdownItRenderer.renderInline(title);