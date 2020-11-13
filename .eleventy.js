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

  // FIXME abandon {% link %}
  // Instead, use a post-build test like https://github.com/stevenvachon/broken-link-checker#sitechecker
  // or https://github.com/Munter/netlify-plugin-checklinks

  eleventyConfig.addLiquidTag("link", function(liquidEngine) {
    return {
      parse: function(tagToken, remainTokens) {
        this.path = tagToken.args;
      },
      render: function(scope, hash) {
        // FIXME this basically does nothing - it doesn't check the file exists

        if (!this.path.startsWith("/")) this.path = "/" + this.path;

        return Promise.resolve(this.path);
      }
    };
  });

  eleventyConfig.setLiquidOptions({
    extname: ''  // Workaround for https://github.com/11ty/eleventy/issues/1504
  });
};
