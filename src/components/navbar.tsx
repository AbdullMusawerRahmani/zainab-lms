"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, GraduationCap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function Navbar() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    const root = document.documentElement;
    if (initial === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
      const root = document.documentElement;
      if (next === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
      window.localStorage.setItem("theme", next);
      return next;
    });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full border-b border-border/70 bg-background/80 backdrop-blur-md",
        "supports-[backdrop-filter]:bg-background/70"
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight sm:text-base text-primaryp">
              Zainab Ghazali LMS
            </span>
            <span className="text-[11px] text-muted-foreground sm:text-xs">
              Smart learning management system
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="hidden items-center gap-4 text-xs font-medium text-muted-foreground sm:flex sm:text-sm">
            <Link href="/" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/students" className="hover:text-foreground">
              Students
            </Link>
            <Link href="/classes" className="hover:text-foreground">
              Classes
            </Link>
          </nav>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/80",
              "bg-background text-foreground shadow-sm transition-colors hover:bg-primary/10 hover:text-primary"
            )}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}


