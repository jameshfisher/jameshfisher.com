import type { Frontmatter } from "./frontmatter";

export type PageData = {
  url: string;
  inputDirPath: string;
  inputFilePath: string;
  outputDirPath: string;
  outputFilePath: string;
};

export type Post = {
  date: Date;
  frontmatter: Frontmatter;
  markdownContent: string;
  page: PageData;
};

export type SitemapPageInfo = {
  url: string;
  date?: Date;
};
