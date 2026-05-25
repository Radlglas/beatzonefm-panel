import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DAYS_DE = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
export const DAYS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTime(time: string): string {
  return time;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const SHOW_COLORS = [
  "#7c3aed", "#2563eb", "#059669", "#dc2626",
  "#d97706", "#db2777", "#0891b2", "#7c3aed",
];

export const JINGLE_CATEGORIES = ["Opener", "Station ID", "Übergabe", "Werbung", "Outro", "Sonstiges"];
export const DOC_CATEGORIES = ["Technik", "Organisation", "Marketing", "Rechtliches", "Sonstiges"];
export const RULE_CATEGORIES = ["Sendetechnik", "Moderation", "Musik", "Verhalten", "Sicherheit"];
