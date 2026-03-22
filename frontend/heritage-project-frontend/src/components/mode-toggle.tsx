import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        isDark ? "bg-primary" : "bg-muted-foreground/30"
      }`}
      aria-label="Toggle theme"
    >
      <span
        className={`inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-background shadow-sm transition-transform duration-300 ease-in-out ${
          isDark ? "translate-x-7" : "translate-x-1"
        }`}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-primary" />
        ) : (
          <Sun className="h-4 w-4 text-muted-foreground" />
        )}
      </span>
    </button>
  );
}
