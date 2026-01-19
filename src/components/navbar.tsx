"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sun, Moon, GraduationCap, Globe, User, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";
type Language = "en" | "ar";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem("language");
  if (stored === "en" || stored === "ar") return stored;
  return "en";
}

export function Navbar() {
  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguage] = useState<Language>("en");
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isAuthenticated = status === "authenticated" && !!session;
  const isLoginPage = pathname === "/";

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    const root = document.documentElement;
    if (initial === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, []);

  useEffect(() => {
    const initial = getInitialLanguage();
    setLanguage(initial);
    const html = document.documentElement;
    if (initial === "ar") html.setAttribute("dir", "rtl");
    else html.setAttribute("dir", "ltr");
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

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next: Language = prev === "en" ? "ar" : "en";
      const html = document.documentElement;
      if (next === "ar") html.setAttribute("dir", "rtl");
      else html.setAttribute("dir", "ltr");
      window.localStorage.setItem("language", next);
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
          {/* Navigation Links - Show only when authenticated and not on login page */}
          {isAuthenticated && !isLoginPage && (
            <nav className="hidden items-center gap-4 text-xs font-medium text-muted-foreground sm:flex sm:text-sm">
              <Link href="/overview" className="hover:text-foreground transition-colors">
                Overview
              </Link>
              <Link href="/students" className="hover:text-foreground transition-colors">
                Students
              </Link>
              <Link href="/classes" className="hover:text-foreground transition-colors">
                Classes
              </Link>
            </nav>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Language Toggle - Always show */}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/80",
                "bg-background text-foreground shadow-sm transition-colors hover:bg-primary/10 hover:text-primary"
              )}
            >
              <Globe className="h-4 w-4" />
              <span className="sr-only">
                {language === "en" ? "Switch to Arabic" : "Switch to English"}
              </span>
            </button>

            {/* Theme Toggle - Always show */}
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

            {/* Authenticated-only buttons - Show only when logged in and not on login page */}
            {isAuthenticated && !isLoginPage && (
              <>
                {/* Notifications */}
                <button
                  type="button"
                  aria-label="Notifications"
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/80",
                    "bg-background text-foreground shadow-sm transition-colors hover:bg-primary/10 hover:text-primary",
                    "relative"
                  )}
                >
                  <Bell className="h-4 w-4" />
                  {/* Notification dot */}
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-background"></span>
                </button>

                {/* Settings */}
                <button
                  type="button"
                  aria-label="Settings"
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/80",
                    "bg-background text-foreground shadow-sm transition-colors hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <Settings className="h-4 w-4" />
                </button>

                {/* User Profile */}
                <button
                  type="button"
                  aria-label="User profile"
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/80",
                    "bg-background text-foreground shadow-sm transition-colors hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <User className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


