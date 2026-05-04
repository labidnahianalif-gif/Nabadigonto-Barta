import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string, lang: string = "bn") {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const locale = lang === "bn" ? "bn-BD" : "en-US";
    return date.toLocaleString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  } catch {
    return dateStr;
  }
}

export function formatTimeOnly(dateStr: string, lang: string = "bn") {
  if (!dateStr) return "";
  try {
    const locale = lang === "bn" ? "bn-BD" : "en-US";
    return new Date(dateStr).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch {
    return "";
  }
}
