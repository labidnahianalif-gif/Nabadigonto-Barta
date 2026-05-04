import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronDown, Menu, X, Languages, Moon, Sun } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useLanguage } from "@/src/contexts/LanguageContext";
import { useTheme } from "@/src/contexts/ThemeContext";

export default function Navbar() {
  const [categories, setCategories] = useState<string[]>(["জাতীয়", "আন্তর্জাতিক", "রাজনীতি", "অর্থনীতি", "খেলাধুলা", "বিনোদন", "প্রযুক্তি", "শিক্ষা", "লাইফস্টাইল", "বিজ্ঞান"]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLanguage, t } = useLanguage();

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(() => {
        console.warn("Failed to fetch categories, using fallbacks");
      });
  }, []);

  const toggleLang = () => {
    const newLang = lang === "bn" ? "en" : "bn";
    setLanguage(newLang);
  };

  const getCategoryName = (cat: string) => {
    return t.categoryMap[cat as keyof typeof t.categoryMap] || cat;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b dark:border-slate-800 shadow-sm transition-colors">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-14">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tighter uppercase dark:text-white">
              {lang === 'bn' ? 'নবদিগন্ত' : 'Naba Diganta'}<span className="text-red-600 ml-1">{lang === 'bn' ? 'বার্তা' : 'Barta'}</span>
            </span>
          </NavLink>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            <NavLink to="/" className={({isActive}) => cn("px-3 py-2 text-sm font-bold uppercase tracking-widest hover:text-red-600 transition-colors", isActive && "text-red-600")}>
              {t.home}
            </NavLink>
            {categories.map((cat) => (
              <NavLink 
                key={cat} 
                to={`/?category=${cat}`} 
                className={({isActive}) => cn(
                  "px-3 py-2 text-sm font-bold uppercase tracking-widest hover:text-red-600 transition-colors",
                  isActive && "text-red-600"
                )}
              >
                {getCategoryName(cat)}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={toggleLang}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
              title={lang === 'bn' ? 'English' : 'বাংলা'}
            >
              <Languages size={18} className="text-slate-500 dark:text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hidden sm:inline">
                {lang === 'bn' ? 'EN' : 'BN'}
              </span>
            </button>

            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun size={18} className="text-slate-500 dark:text-slate-400" /> : <Moon size={18} className="text-slate-500 dark:text-slate-400" />}
            </button>

            <button 
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b dark:border-slate-800 absolute top-full left-0 w-full animate-in slide-in-from-top duration-300 shadow-2xl">
          <div className="p-4 space-y-2">
            <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-bold uppercase tracking-widest text-sm">{t.home}</NavLink>
            {categories.map((cat) => (
              <NavLink 
                key={cat} 
                to={`/?category=${cat}`} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-bold uppercase tracking-widest text-sm border-l-4 border-transparent hover:border-red-600"
              >
                {getCategoryName(cat)}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
