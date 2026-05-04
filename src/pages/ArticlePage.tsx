import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { NewsArticle } from "@/src/types";
import { Clock, User, Facebook, Twitter, MessageSquare, Share2, ArrowLeft, Bookmark, Minus, Plus } from "lucide-react";
import Sidebar from "@/src/components/Sidebar";
import { formatDate } from "@/src/lib/utils";
import { useLanguage } from "@/src/contexts/LanguageContext";

export default function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [fontSize, setFontSize] = useState(1); // 1 = normal, 1.2 = large, 1.5 = extra large
  const [loading, setLoading] = useState(true);
  const { lang, t } = useLanguage();

  const getCategoryName = (cat: string) => {
    return t.categoryMap[cat as keyof typeof t.categoryMap] || cat;
  };

  useEffect(() => {
    setLoading(true);
    fetch("/api/news")
      .then(res => res.json())
      .then(data => {
        const found = data.find((n: any) => n.id === id);
        setArticle(found || null);
        setLoading(false);
        
        // Update views
        if (found) {
          fetch(`/api/news/${found.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ views: (found.views || 0) + 1 })
          });
        }
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 mb-6" />
        <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded w-full mb-4" />
        <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-10" />
        <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-800 rounded-2xl mb-10" />
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">{lang === 'bn' ? 'সংবাদটি খুঁজে পাওয়া যায়নি' : 'Article not found'}</h2>
        <Link to="/" className="text-red-500 font-bold hover:underline">
          {lang === 'bn' ? 'নীল পাতায় ফিরে যান' : 'Return to home page'}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <article className="lg:col-span-8 flex flex-col">
        {/* Meta Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link to={`/?category=${article.category}`} className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
              {getCategoryName(article.category)}
            </Link>
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tighter mb-6 dark:text-white">
            {lang === "en" && article.title_en ? article.title_en : article.title}
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-4 border-y dark:border-slate-800 py-4 text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5"><User size={14} className="text-red-600" /> {article.author}</span>
              <span className="flex items-center gap-1.5" title={lang === 'bn' ? "পাবলিশ হওয়ার সময়" : "Published At"}>
                <Clock size={14} className="text-red-600" /> 
                {formatDate(article.publishedAt, lang)}
                {article.updatedAt && (
                  <span className="ml-2 text-red-500 font-bold">
                    ({(t as any).updated}: {formatDate(article.updatedAt, lang)})
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setFontSize(Math.max(0.8, fontSize - 0.1))}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={lang === 'bn' ? 'ফন্ট সাইজ কমান' : "Decrease font size"}
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded py-0.5 dark:text-slate-200">আ</span>
              <button 
                onClick={() => setFontSize(Math.min(2, fontSize + 0.1))}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={lang === 'bn' ? 'ফন্ট সাইজ বাড়ান' : "Increase font size"}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
 
        {/* Featured Image */}
        <div className="mb-10 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-[16/10] shadow-xl">
          <img 
            src={article.image || `https://picsum.photos/seed/${article.id}/1200/750`} 
            alt={article.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
 
        {/* Article Body */}
        <div 
          className="prose prose-slate dark:prose-invert max-w-none mb-12 leading-loose text-slate-800 dark:text-slate-200"
          style={{ fontSize: `${fontSize}rem` }}
        >
          {(lang === "en" && article.content_en ? article.content_en : article.content).split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-6">{paragraph}</p>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-12 py-6 border-y dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-2 flex items-center">
            {lang === 'bn' ? 'ট্যাগ' : 'Tags'}:
          </span>
          {article.tags.map(tag => (
            <Link key={tag} to={`/?q=${tag}`} className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-medium hover:bg-red-50 hover:text-red-600 transition-colors">
              #{tag}
            </Link>
          ))}
        </div>

        {/* Share & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-12">
          <div className="flex items-center gap-4">
            <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Share2 size={16} /> {lang === 'bn' ? 'শেয়ার করুন' : 'Share'}:
            </h4>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-transform">
                <Facebook size={18} />
              </button>
              <button className="w-10 h-10 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:scale-110 transition-transform">
                <Twitter size={18} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border dark:border-slate-700 px-4 py-2 rounded-lg text-xs font-bold hover:shadow-md transition-all">
              <Bookmark size={16} /> {lang === 'bn' ? 'বুকমার্ক' : 'Bookmark'}
            </button>
            <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border dark:border-slate-700 px-4 py-2 rounded-lg text-xs font-bold hover:shadow-md transition-all">
              <MessageSquare size={16} /> {lang === 'bn' ? 'মন্তব্য' : 'Comment'}
            </button>
          </div>
        </div>

        {/* Back Button */}
        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-red-500 font-bold uppercase text-[10px] tracking-widest transition-colors mb-12">
          <ArrowLeft size={16} /> {lang === 'bn' ? 'মূল পাতায় ফিরে যান' : 'Back to Home'}
        </Link>
      </article>

      {/* Article Sidebar */}
      <div className="lg:col-span-4">
        <Sidebar />
      </div>
    </div>
  );
}
