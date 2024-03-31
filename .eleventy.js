import markdownIt from "markdown-it";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");

  // THINK VERY CAREFULLY before enabling any non-standard Markdown features!
  // I want my .md files to portable in decades ahead.
  // Commonmark seems like the most portable mode.
  const markdownItInstance = markdownIt({
    html: true,
    xhtmlOut: true, // Commonmark compliance
    typographer: true, // Only enabled for 'smartquotes' feature; see https://github.com/markdown-it/markdown-it/issues/730
  }).disable("replacements"); // Weird stuff like '(c)' --> &copy;

  eleventyConfig.setLibrary("md", markdownItInstance);

  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi
      .getAll()
      .filter((page) => page.data.filetype === "blogpost" && !page.data.draft);
  });

  eleventyConfig.setLiquidOptions({
    extname: "", // Workaround for https://github.com/11ty/eleventy/issues/1504
  });
}
