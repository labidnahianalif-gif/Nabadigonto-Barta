import { Search, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLanguage } from "@/src/contexts/LanguageContext";

export default function Header() {
  const [time, setTime] = useState(new Date());
  const { lang, t } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-red-600 text-white p-2 rounded-xl shadow-lg shadow-red-600/30 group-hover:rotate-6 transition-transform duration-300">
              <Newspaper size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter flex items-center dark:text-white">
              {lang === 'bn' ? 'নবদিগন্ত' : 'Naba Diganta'}<span className="text-red-600 ml-1">{lang === 'bn' ? 'বার্তা' : 'Barta'}</span>
            </span>
          </Link>
          <div className="hidden md:block">
            <div className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-0.5">
              {time.toLocaleDateString(lang === 'bn' ? "bn-BD" : "en-US", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="w-1 h-1 bg-slate-400 dark:bg-slate-600 rounded-full animate-pulse" />
              {time.toLocaleTimeString(lang === 'bn' ? "bn-BD" : "en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group hidden sm:block">
            <input 
              type="text" 
              placeholder={t.search} 
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-full py-1.5 px-4 pl-10 text-sm focus:ring-2 focus:ring-red-500 transition-all w-40 focus:w-64 outline-none dark:text-white"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
          </div>
        </div>
      </div>
    </header>
  );
}
