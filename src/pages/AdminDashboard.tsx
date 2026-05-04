import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { NewsArticle, SiteSettings } from "@/src/types";
import { Plus, Edit2, Trash2, LayoutDashboard, FileText, Settings, Users, BarChart, LogOut, ChevronRight, Save, X, Sparkles, Upload, Image as ImageIcon, Languages } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { useLanguage } from "@/src/contexts/LanguageContext";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function AdminDashboard() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [activeTab, setActiveTab] = useState("news");
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const { lang, t } = useLanguage();
  const [currentArticle, setCurrentArticle] = useState<Partial<NewsArticle>>({
    title: "",
    title_en: "",
    summary: "",
    summary_en: "",
    content: "",
    content_en: "",
    category: "জাতীয়",
    author: "নিউজ ডেস্ক",
    tags: [],
    image: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: "নবদিগন্ত বার্তা",
    tickerEnabled: true,
    tickerLabel: "ব্রেকিং নিউজ",
    customTickerText: ""
  });

  // Redirect if not entered via the secret dot
  if (!location.state?.secretEntry && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetch("/api/news").then(res => res.json()).then(setNews);
      fetch("/api/categories").then(res => res.json()).then(setCategories);
      fetch("/api/settings").then(res => res.json()).then(setSiteSettings);
    }
  }, [isAuthenticated]);

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(siteSettings)
    });
    if (res.ok) alert("সেটিংস সফলভাবে আপডেট করা হয়েছে!");
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password === "alif@2026") {
      setIsAuthenticated(true);
    } else {
      alert("ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-2xl border dark:border-slate-800 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-red-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-600/30">
            <LayoutDashboard size={40} />
          </div>
          <h2 className="text-2xl font-black mb-2 dark:text-white uppercase tracking-tighter">অ্যাডমিন প্যানেল</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">সুরক্ষিত এলাকায় প্রবেশ করতে পাসওয়ার্ড দিন</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="পাসওয়ার্ড লিখুন"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-red-500 outline-none text-center font-mono tracking-widest"
            />
            <button 
              type="submit"
              className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
            >
              প্রবেশ করুন <ChevronRight size={20} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setCurrentArticle({ ...currentArticle, image: data.imageUrl });
    } catch (err) {
      console.error(err);
      alert("ছবি আপলোড করতে সমস্যা হয়েছে।");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const method = currentArticle.id ? "PUT" : "POST";
    const url = currentArticle.id ? `/api/news/${currentArticle.id}` : "/api/news";

    const articleToSave = {
      ...currentArticle,
      updatedAt: method === "PUT" ? new Date().toISOString() : currentArticle.updatedAt,
      publishedAt: method === "POST" ? new Date().toISOString() : currentArticle.publishedAt
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(articleToSave)
    });

    if (res.ok) {
      const updated = await res.json();
      if (currentArticle.id) {
        setNews(news.map(n => n.id === updated.id ? updated : n));
      } else {
        setNews([...news, updated]);
      }
      setIsEditing(false);
      setCurrentArticle({ 
        title: "", 
        title_en: "",
        summary: "", 
        summary_en: "",
        content: "", 
        content_en: "",
        category: categories[0], 
        author: "নিউজ ডেস্ক", 
        tags: [], 
        image: "" 
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই সংবাদটি ডিলিট করতে চান?")) {
      try {
        const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
        if (res.ok) {
          setNews(prevNews => prevNews.filter(n => n.id !== id));
        } else {
          alert("সংবাদটি ডিলিট করতে ব্যর্থ হয়েছে। সার্ভারে সমস্যা হতে পারে।");
        }
      } catch (err) {
        console.error("Delete error:", err);
        alert("নেটওয়ার্ক সমস্যা! আবার চেষ্টা করুন।");
      }
    }
  };

  const generateAIContent = async () => {
    if (!currentArticle.title) return alert("প্রথমে সংবাদের শিরোনাম লিখুন!");
    setIsGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", 
        contents: [{ role: "user", parts: [{ text: `Write a detailed formal news article in Bengali for a newspaper named "নবদিগন্ত বার্তা" based on this title: "${currentArticle.title}". Also provide an English translation. Return ONLY a JSON object: { "summary": "...", "content": "...", "tags": ["tag1", "tag2"], "title_en": "...", "summary_en": "...", "content_en": "..." }` }] }]
      });
      
      const text = response.text;
      // Clean markdown code blocks if present
      const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const data = JSON.parse(jsonStr);
      setCurrentArticle({ ...currentArticle, ...data });
    } catch (err) {
      console.error(err);
      alert("AI কনটেন্ট জেনারেট করতে ব্যর্থ হয়েছে।");
    } finally {
      setIsGenerating(false);
    }
  };

  const translateToEnglish = async () => {
    if (!currentArticle.title && !currentArticle.content) return alert("প্রথমে সংবাদের শিরোনাম ও বিষয়বস্তু লিখুন!");
    setIsGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", 
        contents: [{ role: "user", parts: [{ text: `Translate this news article from Bengali to English. Return ONLY a JSON object: { "title_en": "...", "summary_en": "...", "content_en": "..." }. 
        
        Bengali Title: ${currentArticle.title}
        Bengali Summary: ${currentArticle.summary}
        Bengali Content: ${currentArticle.content}` }] }]
      });
      
      const text = response.text;
      const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const data = JSON.parse(jsonStr);
      setCurrentArticle({ ...currentArticle, ...data });
    } catch (err) {
      console.error(err);
      alert("ইংরেজি অনুবাদ তৈরি করতে ব্যর্থ হয়েছে।");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden min-h-[800px] flex">
      {/* Admin Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-400 p-6 flex flex-col">
        <div className="flex items-center gap-2 text-white font-bold mb-10 pb-4 border-b border-slate-800 uppercase tracking-tighter italic">
          <div className="bg-red-600 p-1 rounded">
             <LayoutDashboard size={18} />
          </div>
          Admin Panel
        </div>
        
        <nav className="flex-1 space-y-1">
          <button 
            onClick={() => setActiveTab("news")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === "news" ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "hover:bg-slate-800 hover:text-white"}`}
          >
            <FileText size={18} /> নিউজ ম্যানেজমেন্ট
          </button>
          <button 
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === "analytics" ? "bg-red-600 text-white" : "hover:bg-slate-800 hover:text-white"}`}
          >
            <BarChart size={18} /> অ্যানালিটিক্স
          </button>
          <button 
             onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === "users" ? "bg-red-600 text-white" : "hover:bg-slate-800 hover:text-white"}`}
          >
            <Users size={18} /> ইউজার ম্যানেজমেন্ট
          </button>
          <button 
             onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === "settings" ? "bg-red-600 text-white" : "hover:bg-slate-800 hover:text-white"}`}
          >
            <Settings size={18} /> ওয়েবসাইট সেটিংস
          </button>
        </nav>

        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold hover:bg-slate-800 hover:text-white transition-all mt-auto text-red-500">
          <LogOut size={18} /> লগ আউট
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
            {isEditing ? (currentArticle.id ? "নিউজ এডিট করুন" : "নতুন নিউজ যোগ করুন") : "নিউজ ম্যানেজমেন্ট ড্যাশবোর্ড"}
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-sm font-medium text-slate-400 dark:text-slate-500 capitalize">{activeTab}</span>
          </h2>
          {!isEditing && (
            <button 
              onClick={() => {
                setIsEditing(true);
                setCurrentArticle({ 
                  title: "", 
                  title_en: "",
                  summary: "", 
                  summary_en: "",
                  content: "", 
                  content_en: "",
                  category: categories[0], 
                  author: "নিউজ ডেস্ক", 
                  tags: [], 
                  image: "" 
                });
              }}
              className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
            >
              <Plus size={20} /> নতুন নিউজ
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-6 max-w-4xl bg-slate-50 dark:bg-slate-800/30 p-8 rounded-2xl border dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">নিউজ শিরোনাম</label>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <input 
                      type="text" 
                      required
                      value={currentArticle.title}
                      onChange={e => setCurrentArticle({ ...currentArticle, title: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none dark:text-white"
                      placeholder="বাংলার শিরোনাম..."
                    />
                    <input 
                      type="text" 
                      value={currentArticle.title_en}
                      onChange={e => setCurrentArticle({ ...currentArticle, title_en: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none text-slate-500 dark:text-slate-400 text-sm"
                      placeholder="English Title..."
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      type="button"
                      onClick={generateAIContent}
                      disabled={isGenerating}
                      className="bg-purple-600 text-white px-4 py-3 rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50 text-sm"
                    >
                      {isGenerating ? "প্রসেসিং..." : <><Sparkles size={16} /> AI রাইটার</>}
                    </button>
                    <button 
                      type="button"
                      onClick={translateToEnglish}
                      disabled={isGenerating}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50 text-xs"
                    >
                      <Languages size={14} /> ইংলিশ অনুবাদ
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">বিভাগ</label>
                <select 
                  value={currentArticle.category}
                  onChange={e => setCurrentArticle({ ...currentArticle, category: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none dark:text-white"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">লেখক</label>
                <input 
                  type="text" 
                  value={currentArticle.author}
                  onChange={e => setCurrentArticle({ ...currentArticle, author: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none dark:text-white"
                />
              </div>

              <div className="space-y-4 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">সংবাদচিত্র</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div 
                      className="border-2 border-dashed dark:border-slate-800 rounded-2xl aspect-video flex flex-col items-center justify-center relative overflow-hidden bg-white dark:bg-slate-900 group cursor-pointer"
                      onClick={() => document.getElementById("fileInput")?.click()}
                    >
                      {currentArticle.image ? (
                        <>
                          <img src={currentArticle.image} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="text-white" size={32} />
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-6">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ImageIcon className="text-slate-400" size={24} />
                          </div>
                          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">ছবি আপলোড করতে ক্লিক করুন</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">JPG, PNG, WEBP (Max 5MB)</p>
                        </div>
                      )}
                      
                      {isUploading && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      id="fileInput"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">অথবা ইমেজ লিংক ব্যবহার করুন</label>
                    <input 
                      type="text" 
                      value={currentArticle.image}
                      onChange={e => setCurrentArticle({ ...currentArticle, image: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none dark:text-white"
                      placeholder="https://example.com/image.jpg"
                    />
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <p className="text-xs text-blue-600 dark:text-blue-400 flex gap-2">
                        <Sparkles size={14} className="shrink-0" />
                        সংবাদের জন্য মানসম্মত ছবি ব্যবহার করুন। এআই অটো-জেনারেটেড ছবিগুলো অনেক সময় সঠিক হয় না।
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">সংক্ষিপ্ত সারসংক্ষেপ (BN & EN)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <textarea 
                    rows={2}
                    value={currentArticle.summary}
                    onChange={e => setCurrentArticle({ ...currentArticle, summary: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none resize-none dark:text-white"
                    placeholder="বাংলার সারসংক্ষেপ..."
                  />
                  <textarea 
                    rows={2}
                    value={currentArticle.summary_en}
                    onChange={e => setCurrentArticle({ ...currentArticle, summary_en: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none resize-none text-slate-500 dark:text-slate-400 text-sm"
                    placeholder="English Summary..."
                  />
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">মূল সংবাদ কনটেন্ট (BN & EN)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <textarea 
                    rows={8}
                    required
                    value={currentArticle.content}
                    onChange={e => setCurrentArticle({ ...currentArticle, content: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none dark:text-white"
                    placeholder="বিস্তারিত সংবাদ (বাংলা)..."
                  />
                  <textarea 
                    rows={8}
                    value={currentArticle.content_en}
                    onChange={e => setCurrentArticle({ ...currentArticle, content_en: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none text-slate-500 dark:text-slate-400 text-sm"
                    placeholder="Detailed Content (English)..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t dark:border-slate-800">
              <button 
                type="submit"
                className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
              >
                <Save size={20} /> সংরক্ষণ করুন
              </button>
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
              >
                <X size={20} /> বাতিল
              </button>
            </div>
          </form>
        ) : activeTab === "settings" ? (
          <form onSubmit={handleSaveSettings} className="space-y-8 max-w-2xl bg-white dark:bg-slate-900 p-8 rounded-2xl border dark:border-slate-800 shadow-sm transition-all">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">ওয়েবসাইটের নাম</label>
                <input 
                  type="text" 
                  value={siteSettings.siteName}
                  onChange={e => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none dark:text-white"
                />
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex-1">
                  <h4 className="text-sm font-bold dark:text-white">ব্রেকিং নিউজ টিকার সক্রিয় করুন</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">হোমপেজে স্ক্রলিং নিউজ দেখাবে কি না</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setSiteSettings({ ...siteSettings, tickerEnabled: !siteSettings.tickerEnabled })}
                  className={`w-12 h-6 rounded-full relative transition-colors ${siteSettings.tickerEnabled ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${siteSettings.tickerEnabled ? "translate-x-6" : ""}`} />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">টিকার লেবেল (উদা: ব্রেকিং নিউজ)</label>
                <input 
                  type="text" 
                  value={siteSettings.tickerLabel}
                  onChange={e => setSiteSettings({ ...siteSettings, tickerLabel: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none dark:text-white"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">কাস্টম টিকার টেক্সট (খালি রাখলে সর্বশেষ সংবাদ দেখাবে)</label>
                <textarea 
                  rows={2}
                  value={siteSettings.customTickerText}
                  onChange={e => setSiteSettings({ ...siteSettings, customTickerText: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none dark:text-white"
                  placeholder="এখানে আপনার কাস্টম ব্রেকিং নিউজ লিখুন..."
                />
              </div>

            </div>

            <button 
              type="submit"
              className="bg-red-600 text-white px-10 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
            >
              <Save size={20} /> সেটিংস আপডেট করুন
            </button>
          </form>
        ) : (
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 border-b dark:border-slate-800">
                  <th className="px-6 py-4 w-20">ছবি</th>
                  <th className="px-6 py-4">সংবাদ শিরোনাম</th>
                  <th className="px-6 py-4">বিভাগ</th>
                  <th className="px-6 py-4">তারিখ</th>
                  <th className="px-6 py-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {news.map(article => (
                  <tr key={article.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 group transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                        <img 
                          src={article.image || `https://picsum.photos/seed/${article.id}/100/100`} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200">
                      <div className="font-bold text-sm leading-tight mb-1 group-hover:text-red-600 transition-colors">{article.title}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">{article.author}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {new Date(article.publishedAt).toLocaleDateString(lang === 'bn' ? "bn-BD" : "en-US")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setCurrentArticle(article);
                            setIsEditing(true);
                          }}
                          className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDelete(article.id)}
                          className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {news.length === 0 && (
              <div className="p-20 text-center text-slate-400">
                <FileText size={48} className="mx-auto mb-4 opacity-10" />
                <p>এখনো কোনো সংবাদ যুক্ত করা হয়নি।</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
