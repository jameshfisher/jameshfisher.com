const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {

  eleventyConfig.addPassthroughCopy("assets");
  
  // THINK VERY CAREFULLY before enabling any non-standard Markdown features!
  // I want my .md files to portable in decades ahead.
  // Commonmark seems like the most portable mode.
  const markdownItInstance = markdownIt({
    html: true, 
    xhtmlOut: true, // Commonmark compliance
    typographer: true   // Only enabled for 'smartquotes' feature; see https://github.com/markdown-it/markdown-it/issues/730
  }).disable('replacements');  // Weird stuff like '(c)' --> &copy;

  eleventyConfig.setLibrary("md", markdownItInstance);

  // 'posts' used by the RSS feed
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("_posts/**").filter(post => !post.data.draft);
  });

  eleventyConfig.setLiquidOptions({
    extname: ''  // Workaround for https://github.com/11ty/eleventy/issues/1504
  });
};
