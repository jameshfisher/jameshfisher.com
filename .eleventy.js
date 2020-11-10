const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {

  eleventyConfig.addPassthroughCopy("assets");
  
  const markdownItInstance = markdownIt({
    html: true,
    typographer: true,
  });
  eleventyConfig.setLibrary("md", markdownItInstance);

  // 'posts' used by the RSS feed
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("_posts/**").filter(post => !post.data.draft);
  });

  // FIXME abandon {% post_url %} and  {% link %}
  // Instead, use a post-build test like https://github.com/stevenvachon/broken-link-checker#sitechecker
  // or https://github.com/Munter/netlify-plugin-checklinks

  // Adapted from https://github.com/11ty/eleventy/issues/544#issuecomment-496752551
  eleventyConfig.addLiquidTag("post_url", function(liquidEngine) {
    return {
      parse: function(tagToken, remainTokens) {
        this.path = tagToken.args;
      },
      render: function(scope, hash) {
        
        // There's an ugly ambiguity in Liquid tags: is it a string literal, or a variable reference?
        let isQuoted = this.path.charAt(0) === "'" || this.path.charAt(0) === '"';
        let path = isQuoted ? liquidEngine.evalValue(this.path, scope) : this.path;
  
        path = './_posts/' + path + '.md';

        // This is cheating a little bit because it‘s using the `collections.all` object
        // Anything not in the `all` collection won’t resolve
        let results = scope.contexts[0].collections.all.filter(tmpl => tmpl.inputPath === path);
        if (results.length) {
          return Promise.resolve(results[0].url);
        }
        return Promise.reject(`Template ${path} not found in \`link\` shortcode.`);
      }
    };
  });

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
