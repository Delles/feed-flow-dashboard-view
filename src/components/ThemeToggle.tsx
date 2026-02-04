
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/ThemeProvider"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("light")
    } else {
      // If system, toggle to light first
      setTheme("light")
    }
  }

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-10 w-10 rounded-full bg-secondary/50 hover:bg-primary hover:text-white transition-all duration-300"
        >
          {isDark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="sr-only">Schimbă Tema</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="bg-foreground text-background font-bold text-[10px] uppercase tracking-widest px-3 py-2 rounded-xl border-none mt-2">
        {isDark ? "Modul Luminos" : "Modul Întunecat"}
      </TooltipContent>
    </Tooltip>
  )
}
