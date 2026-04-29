import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

const STORAGE_KEY = "lumen-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "theme-sepia");
  if (theme === "dark") root.classList.add("dark");
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyThemeClass(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed top-3 right-3 md:top-4 md:right-4 z-[60] inline-flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full kawaii-pill text-rose-500 hover:bg-pink-50 active:scale-95 transition-all backdrop-blur-sm"
    >
      {isDark ? (
        <Sun className="w-4 h-4 md:w-[18px] md:h-[18px]" />
      ) : (
        <Moon className="w-4 h-4 md:w-[18px] md:h-[18px]" />
      )}
    </button>
  );
}
