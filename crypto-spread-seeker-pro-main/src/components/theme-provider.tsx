
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Apply initial theme class based on saved preference
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "system";
    
    // Apply correct class to document based on saved theme or system preference
    if (savedTheme === "dark" || 
        (savedTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Listen for system theme changes when using system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (localStorage.getItem("theme") === "system") {
        document.documentElement.classList.toggle("dark", mediaQuery.matches);
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
  
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
