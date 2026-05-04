import { TrendingUp, Award, Share2, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { NewsArticle, SiteSettings } from "@/src/types";
import NewsCard from "./NewsCard";
import { useLanguage } from "@/src/contexts/LanguageContext";

export default function Sidebar() {
  const [trending, setTrending] = useState<NewsArticle[]>([]);
  const [popular, setPopular] = useState<NewsArticle[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const { lang, t } = useLanguage();

  const getCategoryName = (cat: string) => {
    return t.categoryMap[cat as keyof typeof t.categoryMap] || cat;
  };

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(setSettings);

    fetch("/api/news")
      .then(res => res.json())
      .then(data => {
        setTrending(data.filter((n: any) => n.trending).slice(0, 5));
        setPopular(data.sort((a: any, b: any) => b.views - a.views).slice(0, 5));
      });
  }, []);

  return (
    <aside className="space-y-10">
      {/* Trending */}
      <section>
        <div className="flex items-center gap-2 mb-6 pb-2 border-b-2 border-red-600 w-fit">
          <TrendingUp size={18} className="text-red-600" />
          <h3 className="font-bold uppercase tracking-tighter text-lg">{lang === 'bn' ? 'ট্রেন্ডিং নিউজ' : 'Trending News'}</h3>
        </div>
        <div className="space-y-4">
          {trending.length > 0 ? trending.map((article: NewsArticle) => (
            <NewsCard key={article.id} article={article} variant="mini" />
          )) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 italic">{lang === 'bn' ? 'বর্তমানে কোনো ট্রেন্ডিং নিউজ নেই' : 'No trending news right now'}</p>
          )}
        </div>
      </section>
 
      {/* Most Read */}
      <section>
        <div className="flex items-center gap-2 mb-6 pb-2 border-b-2 border-red-600 w-fit">
          <Award size={18} className="text-red-600" />
          <h3 className="font-bold uppercase tracking-tighter text-lg">{t.mostRead}</h3>
        </div>
        <div className="space-y-6">
          {popular.map((article: NewsArticle, idx) => (
            <Link key={article.id} to={`/article/${article.id}`} className="flex gap-4 group">
              <span className="text-3xl font-black text-slate-200 dark:text-slate-700 group-hover:text-red-600 transition-colors leading-none italic">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <h4 className="text-sm font-bold leading-tight group-hover:text-red-600 transition-colors line-clamp-2">
                  {lang === "en" && article.title_en ? article.title_en : article.title}
                </h4>
                {article.updatedAt && (
                  <span className="text-[9px] text-red-500 font-bold uppercase mt-1 block tracking-widest">
                    {(t as any).updated}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Social Follow */}
      <section className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl p-6">
        <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-center border-b dark:border-slate-800 pb-4 flex items-center justify-center gap-2">
          <Share2 size={16} /> {lang === 'bn' ? 'আমাদের সাথে থাকুন' : 'Stay With Us'}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <a href="#" className="flex items-center gap-2 bg-blue-600 text-white p-2 rounded text-xs font-bold hover:opacity-90 transition-opacity justify-center">
            Facebook
          </a>
          <a href="#" className="flex items-center gap-2 bg-red-600 text-white p-2 rounded text-xs font-bold hover:opacity-90 transition-opacity justify-center">
            Youtube
          </a>
        </div>
      </section>
    </aside>
  );
}
