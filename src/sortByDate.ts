import type { Post } from "./types";

export function sortByDate(posts: Post[]) {
  return [...posts].sort((a, b) => b.date.getTime() - a.date.getTime());
}
