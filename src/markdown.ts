import MarkdownIt from "markdown-it";
import Prism from "prismjs";
// import "prismjs/components/prism-gas";
// import "prismjs/components/prism-liquid";
// import "prismjs/components/prism-php";
// import "prismjs/components/prism-s";
// import "prismjs/components/prism-sparql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-bnf";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-diff";
import "prismjs/components/prism-ebnf";
import "prismjs/components/prism-glsl";
import "prismjs/components/prism-go";
import "prismjs/components/prism-haskell";
import "prismjs/components/prism-json";
import "prismjs/components/prism-makefile";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-prolog";
import "prismjs/components/prism-python";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-scheme";
import "prismjs/components/prism-shell-session";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-swift";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-yaml";

import { h, rawHtml } from "./vhtml";

// Langs we have code blocks for, but Prism doesn't support
const ignoreLangs = ["asn1", "gas", "lean", "liquid", "php", "s", "sparql"];

const nohighlight = (code: string, lang?: string): string =>
  h(
    "pre",
    { class: lang ? "language-text" : undefined },
    h("code", { class: lang ? "language-text" : undefined }, code)
  ).rawHtml;

const langToPrismLang = {
  console: "shell-session",
  Makefile: "makefile",
  "c++": "cpp",
} as Record<string, string>;

const highlight = (code: string, lang: string): string => {
  lang = langToPrismLang[lang] || lang;

  // trim ending newline; consistent with old highlighter
  code = code.replace(/\n$/, "");

  if (!lang) {
    return nohighlight(code);
  }
  const grammar = Prism.languages[lang];
  if (!grammar) {
    if (ignoreLangs.includes(lang)) {
      return nohighlight(code);
    }
    console.warn(`Prism doesn't support language '${lang}'`);
    return nohighlight(code, lang);
  }
  const html = Prism.highlight(code, grammar, lang);
  return h(
    "pre",
    { class: `language-${lang}` },
    h("code", { class: `language-${lang}` }, rawHtml(html))
  ).rawHtml;
};

// THINK VERY CAREFULLY before enabling any non-standard Markdown features!
// I want my .md files to portable in decades ahead.
// Commonmark seems like the most portable mode.
const md = MarkdownIt({
  html: true,
  xhtmlOut: true, // Commonmark compliance
  typographer: true, // Only enabled for 'smartquotes' feature; see https://github.com/markdown-it/markdown-it/issues/730
  highlight,
}).disable("replacements"); // Weird stuff like '(c)' --> &copy;

export function markdownToHtml(markdownContent: string): string {
  return md.render(markdownContent);
}

export const renderInlineMarkdown = (title: string) => md.renderInline(title);
