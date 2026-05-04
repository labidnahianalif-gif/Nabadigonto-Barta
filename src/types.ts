export interface NewsArticle {
  id: string;
  title: string;
  title_en?: string;
  summary: string;
  summary_en?: string;
  content: string;
  content_en?: string;
  category: string;
  author: string;
  image: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  trending?: boolean;
  views: number;
}

export interface SiteSettings {
  siteName: string;
  tickerEnabled: boolean;
  tickerLabel?: string;
  customTickerText?: string;
}

export type Category = string;

export type Language = "bn" | "en";
