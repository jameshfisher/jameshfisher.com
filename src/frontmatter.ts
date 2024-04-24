import matter from "gray-matter";
import { z } from "zod";

const frontmatterSchema = z.object({
  title: z.string(),
  justification: z.string().optional(),
  draft: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  taggedAt: z.string().optional(),
  ogimage: z.string().optional(),
  author: z.string().optional(),
  external_url: z.string().optional(),
  hnUrl: z.string().optional(),
  hnUpvotes: z.number().optional(),
  summary: z.string().optional(),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;

export type PostFileContent = {
  frontmatter: Frontmatter;
  content: string;
};

const parseFrontmatter = (frontmatter: unknown): Frontmatter =>
  frontmatterSchema.parse(frontmatter);

export const parsePostFileContent = (fileContent: string): PostFileContent => {
  const { data: unparsedFrontmatter, content } = matter(fileContent);
  return { frontmatter: parseFrontmatter(unparsedFrontmatter), content };
};

export const stringifyPostFileContent = ({
  frontmatter,
  content,
}: PostFileContent) => matter.stringify(content, frontmatter);
