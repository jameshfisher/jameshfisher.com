import { Liquid } from "liquidjs";
import { markdownToHtml } from "./markdown";

const liquidEngine = new Liquid({
  root: "./_includes",
});

export function liquidMarkdownToHtml(liquidMarkdown: string) {
  return markdownToHtml(liquidEngine.parseAndRenderSync(liquidMarkdown));
}
