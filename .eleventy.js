import markdownIt from "markdown-it";
import * as fs from "fs";
import * as path from "path";

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
    const inputDirPath = `_posts/${year}-${month}-${day}-${slug}`;
    if (!fs.existsSync(inputDirPath)) return;

    const outputDirPath = path.dirname(outputPath);
    fs.mkdirSync(outputDirPath, { recursive: true });

    fs.readdirSync(inputDirPath)
      .filter((filename) => filename !== `index.md`)
      .forEach((filename) => {
        const sourcePath = path.join(inputDirPath, filename);
        const destPath = path.join(outputDirPath, filename);
        console.log(`Copying ${sourcePath} to ${destPath}`);
        fs.copyFileSync(sourcePath, destPath);
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
