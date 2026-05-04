import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { NewsArticle, SiteSettings } from "@/src/types";
import { useLanguage } from "@/src/contexts/LanguageContext";

export default function Ticker() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const { lang, t } = useLanguage();

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(setSettings);

    fetch("/api/news")
      .then(res => res.json())
      .then(data => setNews(data.slice(0, 5)));
  }, []);

  if (!settings?.tickerEnabled) return null;

  return (
    <div className="bg-slate-100 dark:bg-slate-800/50 py-1 border-b dark:border-slate-800">
      <div className="container mx-auto px-4 flex items-center gap-4 max-w-7xl overflow-hidden">
        <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs uppercase whitespace-nowrap bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded shrink-0">
          <TrendingUp size={14} />
          {lang === 'bn' ? (settings.tickerLabel || t.breakingNews) : (t.breakingNews)}
        </div>
        <div className="relative flex-1 h-6 overflow-hidden">
          <div className="flex items-center gap-12 animate-ticker whitespace-nowrap">
            {settings.customTickerText && lang === 'bn' ? (
              <span className="text-sm font-bold text-red-600 underline decoration-red-600/30 underline-offset-4">{settings.customTickerText}</span>
            ) : (
              <>
                {news.map((item) => (
                  <Link 
                    key={item.id} 
                    to={`/article/${item.id}`}
                    className="text-sm font-medium dark:text-slate-200 hover:text-red-600 transition-colors"
                  >
                    <span className="text-slate-400 dark:text-slate-600 mr-2">•</span>
                    {lang === "en" && item.title_en ? item.title_en : item.title}
                  </Link>
                ))}
                {news.map((item) => (
                  <Link 
                    key={`${item.id}-mirror`} 
                    to={`/article/${item.id}`}
                    className="text-sm font-medium dark:text-slate-200 hover:text-red-600 transition-colors"
                  >
                    <span className="text-slate-400 dark:text-slate-600 mr-2">•</span>
                    {lang === "en" && item.title_en ? item.title_en : item.title}
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
