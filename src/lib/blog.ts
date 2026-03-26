import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "src/content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  author: string;
  category: string;
  date: string;
  excerpt: string;
  content: string;
  htmlContent?: string;
  tags?: string[];
  focusKeyword?: string;
  metaTitle?: string;
  metaDescription?: string;
  series?: string | null;
  seriesOrder?: number;
  readTime?: string;
  image?: string;
  draft?: boolean;
}

export function getAllPosts(): BlogPost[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const posts = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        slug: data.slug || fileName.replace(/\.md$/, ""),
        title: data.title,
        author: data.author,
        category: data.category,
        date: data.date,
        excerpt: data.excerpt,
        content,
        tags: data.tags || [],
        focusKeyword: data.focusKeyword || "",
        metaTitle: data.metaTitle || "",
        metaDescription: data.metaDescription || "",
        series: data.series || null,
        seriesOrder: data.seriesOrder || 0,
        readTime: data.readTime || "",
        image: data.image || "",
        draft: data.draft || false,
      } as BlogPost;
    });

  return posts
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const posts = getAllPosts();
  return posts.find((post) => post.slug === slug);
}

export async function getPostHtml(content: string): Promise<string> {
  const result = await remark().use(html).process(content);
  return result.toString();
}

export function getAllCategories(): string[] {
  const posts = getAllPosts();
  const categories = new Set(posts.map((p) => p.category));
  return Array.from(categories);
}

export function getPostsBySeries(series: string): BlogPost[] {
  return getAllPosts()
    .filter((p) => p.series === series)
    .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));
}
