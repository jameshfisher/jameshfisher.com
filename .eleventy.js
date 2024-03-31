import markdownIt from "markdown-it";
import * as fs from "fs";

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

  function passThroughAssets(outputPath) {
    const match = outputPath.match(
      /_site\/(\d{4})\/(\d{2})\/(\d{2})\/(.+)\/index.html/,
    );
    if (!match) return;
    const [, year, month, day, slug] = match;
    const postDir = `_posts/${year}-${month}-${day}`;
    if (!fs.existsSync(postDir)) return;

    fs.readdirSync(postDir)
      .filter((file) => file !== `${slug}.md`)
      .forEach((file) => {
        const source = `${postDir}/${file}`;
        const dest = outputPath.replace(/index\.html$/, file);
        console.log(`Copying ${source} to ${dest}`);
        fs.copyFileSync(source, dest);
      });
  }

  eleventyConfig.addTransform(
    "pass through post-specific assets",
    function (content, outputPath) {
      passThroughAssets(outputPath);
      return content;
    },
  );
}
