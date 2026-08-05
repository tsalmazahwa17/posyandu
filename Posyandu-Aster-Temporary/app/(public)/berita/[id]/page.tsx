import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import NewsDetailView, { NewsArticleData } from "@/components/news/NewsDetailView";
import { notFound } from "next/navigation";

type RelatedArticle = Prisma.NewsGetPayload<{
  include: { category: { select: { id: true; name: true } } };
}>;

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const newsId = parseInt(id);

  if (!isNaN(newsId)) {
    try {
      const article = await prisma.news.findUnique({
        where: { id: newsId },
      });
      if (article) {
        const description = article.excerpt || article.title;
        const image = article.thumbnail?.trim();
        return {
          title: `${article.title} | Posyandu Aster`,
          description,
          openGraph: {
            title: article.title,
            description,
            ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: article.title }] } : {}),
          },
          twitter: {
            card: image ? "summary_large_image" : "summary",
            title: article.title,
            description,
            ...(image ? { images: [image] } : {}),
          },
        };
      }
    } catch (error) {
      console.error("[generateMetadata] Database fetch error:", error);
    }
  }

  return {
    title: "Detail Berita | Posyandu Aster",
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const newsId = parseInt(id);

  let article: NewsArticleData | null = null;
  let relatedArticles: RelatedArticle[] = [];

  if (!isNaN(newsId)) {
    try {
      article = await prisma.news.findUnique({
        where: { id: newsId },
        include: {
          category: { select: { id: true, name: true } },
          author: { select: { id: true, fullName: true } },
        },
      });

      if (article) {
        relatedArticles = await prisma.news.findMany({
          where: {
            id: { not: newsId },
            isPublished: true,
          },
          orderBy: { createdAt: "desc" },
          take: 3,
          include: {
            category: { select: { id: true, name: true } },
          },
        });
      }
    } catch (error) {
      console.error("[NewsDetailPage] Database fetch error:", error);
    }
  }


  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between">
      <Navbar />

      <main className="pt-28 pb-20 flex-1">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          {/* Reusable NewsDetailView */}
          <NewsDetailView
            article={article}
            backHref="/berita"
            backLabel="Kembali ke Daftar Berita"
          />

          {/* Related Articles Section */}
          {relatedArticles.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-gray-200/80">
              <h2 className="text-xl font-bold text-slate-900">Kabar Aster Lainnya</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/berita/${rel.id}`}
                    className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
                  >
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 block w-fit mb-2">
                        {rel.category?.name || "Berita"}
                      </span>
                      <h3 className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition line-clamp-2">
                        {rel.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {rel.excerpt || rel.content}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-end text-xs font-semibold text-blue-600">
                      <span>Baca artikel</span>
                      <ArrowRight size={14} className="ml-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
