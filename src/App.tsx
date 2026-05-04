import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "@/src/pages/Home";
import ArticlePage from "@/src/pages/ArticlePage";
import AdminDashboard from "@/src/pages/AdminDashboard";
import Header from "@/src/components/Header";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import Ticker from "@/src/components/Ticker";
import { SiteSettings } from "./types";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function App() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then(setSettings);
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <Header />
            <Navbar />
            {settings?.tickerEnabled && <Ticker />}
            
            <main className="container mx-auto px-4 py-8 max-w-7xl min-h-[70vh]">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/article/:id" element={<ArticlePage />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}
