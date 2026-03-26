import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, getPostHtml } from "@/lib/blog";
import ScrollReveal from "@/components/ScrollReveal";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;

  return {
    title: `${title} | Networking For Awesome People`,
    description,
    openGraph: {
      title: `${title} | Networking For Awesome People`,
      description,
      url: `https://networkingforawesomepeople.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
    alternates: {
      canonical: `https://networkingforawesomepeople.com/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const htmlContent = await getPostHtml(post.content);

  const allPosts = getAllPosts();
  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "Networking For Awesome People",
      url: "https://networkingforawesomepeople.com",
    },
    datePublished: post.date,
    description: post.excerpt,
    url: `https://networkingforawesomepeople.com/blog/${post.slug}`,
    keywords: post.tags?.join(", "),
  };

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />

      {/* Back link */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-[750px] mx-auto">
          <Link
            href="/blog"
            className="text-navy/50 hover:text-navy text-sm font-medium transition-colors"
          >
            &larr; Back to Business Talk
          </Link>
        </div>
      </div>

      {/* Post header */}
      <section className="bg-white pt-12 md:pt-16 pb-8 px-4">
        <div className="max-w-[750px] mx-auto">
          <span className="inline-block bg-gold text-navy text-xs font-bold px-3 py-1 rounded-full mb-4">
            {post.category}
          </span>
          {post.series && (
            <p className="text-navy/50 text-sm font-medium mb-2">
              Part {post.seriesOrder || 1} of {post.series}
            </p>
          )}
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-navy leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-navy/50">
            <span className="font-medium text-navy">{post.author}</span>
            <span>&middot;</span>
            <span>{formattedDate}</span>
            {post.readTime && (
              <>
                <span>&middot;</span>
                <span>{post.readTime}</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Post body */}
      <section className="bg-white pb-16 md:pb-24 px-4">
        <article
          className="max-w-[750px] mx-auto prose prose-lg prose-navy prose-headings:font-heading prose-headings:text-navy prose-a:text-gold hover:prose-a:text-navy"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </section>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-[#F8F9FA] py-16 md:py-24 px-4">
          <ScrollReveal>
            <div className="w-[90%] max-w-[1200px] mx-auto">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-navy text-center mb-12">
                More Business Talk
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((rp) => (
                  <Link
                    key={rp.slug}
                    href={`/blog/${rp.slug}`}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
                  >
                    <div className="bg-gradient-to-br from-navy to-navy/80 h-40 flex items-center justify-center relative">
                      <span className="text-white/10 font-heading text-2xl font-bold">
                        Networking For Awesome People
                      </span>
                      <span className="absolute top-3 right-3 bg-gold text-navy text-xs font-bold px-3 py-1 rounded-full">
                        {rp.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading text-base font-bold text-navy mb-2 group-hover:text-gold transition-colors line-clamp-2">
                        {rp.title}
                      </h3>
                      <p className="text-navy/50 text-sm line-clamp-2">{rp.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* CTA */}
      <section className="bg-navy py-16 md:py-24 px-4">
        <ScrollReveal>
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Network in Middle Tennessee?
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-10">
              Networking For Awesome People meets every week across four cities. It&apos;s free,
              it&apos;s welcoming, and it&apos;s waiting for you.
            </p>
            <Link
              href="/#cities"
              className="inline-block bg-gold text-navy font-bold text-lg px-10 py-4 rounded-full hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              Find Your City
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
