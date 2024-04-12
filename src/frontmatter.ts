import { z } from "zod";

const frontmatterSchema = z.object({
  title: z.string(),
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

export const parseFrontmatter = (frontmatter: unknown): Frontmatter => {
  return frontmatterSchema.parse(frontmatter);
};
