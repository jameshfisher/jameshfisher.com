export type Frontmatter = {
  title: string;
  draft?: boolean;
  tags?: string[];
  ogimage?: string;
  author?: string;
  external_url?: string;
  hnUrl?: string;
  hnUpvotes?: number;
  summary?: string;
};

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
