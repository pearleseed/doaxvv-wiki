import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "@/shared/hooks/useTranslation";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="min-h-[44px] min-w-[44px] rounded-full hover:bg-accent/10 hover:text-accent transition-colors duration-300"
      onClick={toggleTheme}
      aria-label={t("theme.toggle")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all text-secondary dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all text-primary dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
