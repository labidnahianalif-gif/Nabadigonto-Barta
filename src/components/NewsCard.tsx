import { Link } from "react-router-dom";
import { Clock, User } from "lucide-react";
import { NewsArticle } from "@/src/types";
import { formatDate } from "@/src/lib/utils";
import { useLanguage } from "@/src/contexts/LanguageContext";

interface Props {
  article: NewsArticle;
  variant?: "horizontal" | "vertical" | "mini";
  key?: string | number;
}

export default function NewsCard({ article, variant = "vertical" }: Props) {
  const { lang, t } = useLanguage();

  const getCategoryName = (cat: string) => {
    return t.categoryMap[cat as keyof typeof t.categoryMap] || cat;
  };

  if (variant === "mini") {
    return (
      <Link to={`/article/${article.id}`} className="group flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors">
        <div className="w-24 h-16 flex-shrink-0 bg-slate-200 dark:bg-slate-800 rounded overflow-hidden">
          <img 
            src={article.image || `https://picsum.photos/seed/${article.id}/200/120`} 
            alt={article.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h4 className="text-sm font-bold leading-tight line-clamp-2 group-hover:text-red-600 transition-colors">
            {lang === "en" && article.title_en ? article.title_en : article.title}
          </h4>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">{getCategoryName(article.category)}</span>
        </div>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link to={`/article/${article.id}`} className="group flex flex-col md:flex-row gap-6 p-4 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl hover:shadow-lg transition-all">
        <div className="w-full md:w-1/3 aspect-[4/3] bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden">
          <img 
            src={article.image || `https://picsum.photos/seed/${article.id}/800/600`} 
            alt={article.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 py-2">
          <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-red-600">
            <span className="bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded cursor-default">{getCategoryName(article.category)}</span>
          </div>
          <h3 className="text-xl font-bold mb-3 group-hover:text-red-600 transition-colors leading-snug">
            {lang === "en" && article.title_en ? article.title_en : article.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mb-4 leading-relaxed">
            {lang === "en" && article.summary_en ? article.summary_en : article.summary}
          </p>
          <div className="flex items-center gap-6 text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest mt-auto">
            <span className="flex items-center gap-1"><User size={12} /> {article.author}</span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> 
              {article.updatedAt ? (
                <span className="text-red-500 font-bold">
                  {(t as any).updated}: {formatDate(article.updatedAt, lang)}
                </span>
              ) : (
                formatDate(article.publishedAt, lang)
              )}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/article/${article.id}`} className="group flex flex-col bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-xl transition-all">
      <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
        <img 
          src={article.image || `https://picsum.photos/seed/${article.id}/800/450`} 
          alt={article.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-widest">
            {getCategoryName(article.category)}
          </span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold mb-3 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
          {lang === "en" && article.title_en ? article.title_en : article.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mb-4 leading-relaxed">
          {lang === "en" && article.summary_en ? article.summary_en : article.summary}
        </p>
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest mt-auto border-t dark:border-slate-800 pt-4">
          <span className="flex items-center gap-1"><User size={12} /> {article.author}</span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> 
            {article.updatedAt ? (
              <span className="text-red-500 font-bold">
                {(t as any).updated}: {formatDate(article.updatedAt, lang)}
              </span>
            ) : (
              formatDate(article.publishedAt, lang)
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}
