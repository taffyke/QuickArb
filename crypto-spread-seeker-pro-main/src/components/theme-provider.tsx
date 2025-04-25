"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Apply initial theme class based on saved preference
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "system";
    const savedAccentColor = localStorage.getItem("accentColor") || "blue";
    
    // Apply correct class to document based on saved theme or system preference
    if (savedTheme === "dark" || 
        (savedTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
    
    // Apply accent color
    document.documentElement.setAttribute("data-accent-color", savedAccentColor);
    
    // Listen for system theme changes when using system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (localStorage.getItem("theme") === "system") {
        document.documentElement.classList.toggle("dark", mediaQuery.matches);
        document.documentElement.classList.toggle("light", !mediaQuery.matches);
      }
    };
    
    // Listen for theme change events from settings
    const handleThemeChange = (event: CustomEvent) => {
      if (event.detail) {
        const { theme, accentColor } = event.detail;
        if (theme) {
          if (theme === "dark") {
            document.documentElement.classList.add("dark");
            document.documentElement.classList.remove("light");
          } else if (theme === "light") {
            document.documentElement.classList.add("light");
            document.documentElement.classList.remove("dark");
          } else if (theme === "system") {
            const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
            document.documentElement.classList.toggle("dark", isDarkMode);
            document.documentElement.classList.toggle("light", !isDarkMode);
          }
          localStorage.setItem("theme", theme);
        }
        
        if (accentColor) {
          document.documentElement.setAttribute("data-accent-color", accentColor);
          localStorage.setItem("accentColor", accentColor);
        }
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    window.addEventListener('theme-change' as any, handleThemeChange as EventListener);
    
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      window.removeEventListener('theme-change' as any, handleThemeChange as EventListener);
    };
  }, []);
  
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
