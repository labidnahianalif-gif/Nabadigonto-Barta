import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { NewsArticle } from "@/src/types";
import NewsCard from "@/src/components/NewsCard";
import Sidebar from "@/src/components/Sidebar";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/src/contexts/LanguageContext";

export default function Home() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const { lang, t } = useLanguage();

  useEffect(() => {
    if (news.length === 0) setLoading(true);
    
    fetch("/api/news")
      .then(res => res.json())
      .then(data => {
        if (categoryFilter) {
          setNews(data.filter((n: any) => n.category === categoryFilter));
        } else {
          setNews(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categoryFilter]);

  const getCategoryName = (cat: string) => {
    return t.categoryMap[cat as keyof typeof t.categoryMap] || cat;
  };

  const leadNews = news.length > 0 ? news[0] : null;
  const topStories = news.slice(1, 5);
  const remainingNews = news.slice(5);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t.loading}</p>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-full mb-6">
          <ChevronRight size={48} className="text-slate-300 dark:text-slate-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t.noNews}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t.tryAgain}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Main Content */}
      <div className="lg:col-span-8 space-y-12">
        {/* Lead News */}
        {leadNews && !categoryFilter && (
          <section>
            <div className="relative group rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9]">
              <img 
                src={leadNews.image || `https://picsum.photos/seed/${leadNews.id}/1200/600`}
                alt={leadNews.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-10">
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded w-fit mb-4 uppercase tracking-widest">{t.leadNews}</span>
                <Link to={`/article/${leadNews.id}`}>
                  <h1 className="text-white text-2xl md:text-4xl font-bold mb-4 line-clamp-2 hover:text-red-500 transition-colors leading-tight tracking-tight">
                    {leadNews.title}
                  </h1>
                </Link>
                <p className="text-slate-300 text-sm md:text-base line-clamp-2 mb-6 hidden md:block max-w-2xl leading-relaxed">
                  {leadNews.summary}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium uppercase tracking-widest">
                  <span>{leadNews.author}</span>
                  <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                  <span>{new Date(leadNews.publishedAt).toLocaleDateString(lang === 'bn' ? "bn-BD" : "en-US")}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Top Stories Grid */}
        <section>
          {categoryFilter && (
            <div className="flex items-center gap-2 mb-8 pb-4 border-b dark:border-slate-800">
              <h2 className="text-2xl font-bold tracking-tighter uppercase">{getCategoryName(categoryFilter)}</h2>
              <span className="text-slate-400 dark:text-slate-500 text-sm italic">— {t.allStories}</span>
            </div>
          )}
          {!categoryFilter && (
             <div className="flex items-center justify-between mb-8 pb-4 border-b dark:border-slate-800">
              <h2 className="text-2xl font-bold tracking-tighter uppercase border-b-2 border-red-600 pb-4 -mb-4.5">{t.topStories}</h2>
              <Link to="/?category=রাজনীতি" className="text-xs font-bold text-red-600 uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center">
                {t.seeMore} <ChevronRight size={14} />
              </Link>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(categoryFilter ? news : topStories).map((article: NewsArticle) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </section>

        {/* Categories / Remaining */}
        {!categoryFilter && remainingNews.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center justify-between mb-8 pb-4 border-b dark:border-slate-800">
              <h2 className="text-2xl font-bold tracking-tighter uppercase">{t.otherNews}</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {remainingNews.map((article: NewsArticle) => (
                <NewsCard key={article.id} article={article} variant="horizontal" />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-4">
        <Sidebar />
      </div>
    </div>
  );
}
