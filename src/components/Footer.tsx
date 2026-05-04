import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";
import { useLanguage } from "@/src/contexts/LanguageContext";

export default function Footer() {
  const { lang, t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-12 border-t border-slate-800">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & About */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="bg-red-600 text-white p-1 rounded">
                <Newspaper size={20} />
              </div>
              <span className="text-xl font-bold tracking-tighter uppercase text-white">
                {lang === 'bn' ? 'নবদিগন্ত' : 'Naba Diganta'}<span className="text-red-600 ml-1">{lang === 'bn' ? 'বার্তা' : 'Barta'}</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              {lang === 'bn' 
                ? 'সত্য ও বস্তুনিষ্ঠ সংবাদ পরিবেশনায় আমরা সর্বদা অঙ্গীকারবদ্ধ। ব্রেকিং নিউজ এবং সবশেষ খবরের আপডেট পেতে আমাদের সাথেই থাকুন।' 
                : 'We are committed to delivering truthful and objective news. Stay with us for breaking news and the latest updates.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
              {lang === 'bn' ? 'প্রয়োজনীয় লিংক' : 'Quick Links'}
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-red-500 transition-colors">{t.about}</Link></li>
              <li><Link to="/contact" className="hover:text-red-500 transition-colors">{t.contact}</Link></li>
              <li><Link to="/terms" className="hover:text-red-500 transition-colors">{lang === 'bn' ? 'ব্যবহারের শর্তাবলি' : 'Terms & Conditions'}</Link></li>
              <li><Link to="/privacy" className="hover:text-red-500 transition-colors">{lang === 'bn' ? 'গোপনীয়তা নীতিমালা' : 'Privacy Policy'}</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
              {t.categories}
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Link to="/?category=জাতীয়" className="hover:text-red-500 transition-colors">{lang === 'bn' ? 'জাতীয়' : 'National'}</Link>
              <Link to="/?category=রাজনীতি" className="hover:text-red-500 transition-colors">{lang === 'bn' ? 'রাজনীতি' : 'Politics'}</Link>
              <Link to="/?category=আন্তর্জাতিক" className="hover:text-red-500 transition-colors">{lang === 'bn' ? 'আন্তর্জাতিক' : 'International'}</Link>
              <Link to="/?category=খেলাধুলা" className="hover:text-red-500 transition-colors">{lang === 'bn' ? 'খেলাধুলা' : 'Sports'}</Link>
              <Link to="/?category=বিনোদন" className="hover:text-red-500 transition-colors">{lang === 'bn' ? 'বিনোদন' : 'Entertainment'}</Link>
              <Link to="/?category=বিজ্ঞান" className="hover:text-red-500 transition-colors">{lang === 'bn' ? 'বিজ্ঞান' : 'Science'}</Link>
            </div>
          </div>

          {/* Social Removal - Keeping space or removing column */}
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:row items-center justify-between gap-4 text-xs text-slate-500 uppercase tracking-widest font-medium">
          <p>© {new Date().getFullYear()} {t.siteName}। {lang === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}</p>
          <div className="flex items-center gap-1">
            {t.developedBy} 
            <Link 
              to="/admin" 
              state={{ secretEntry: true }}
              className="inline-block w-1.5 h-1.5 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors cursor-default" 
              title={t.secret} 
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
