import * as fs from "fs";
import grayMatter from "gray-matter";
import { renderPage } from "../layouts/page";
import { liquidMarkdownToHtml } from "../liquidMarkdown";
import { rawHtml } from "../vhtml";

export function renderCv() {
  const fileContent = fs.readFileSync("./cv.md", "utf-8");
  const { content: liquidMarkdownContent } = grayMatter(fileContent);
  const contentHtml = liquidMarkdownToHtml(liquidMarkdownContent);
  return renderPage({
    content: rawHtml(contentHtml),
    data: {
      title: "Jim Fisher – Product Engineer",
    },
    page: {
      url: "/cv/",
    },
  });
}
