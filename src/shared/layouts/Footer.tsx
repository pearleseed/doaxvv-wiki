import { useTranslation } from "@/shared/hooks/useTranslation";

/**
 * Footer component with ARIA contentinfo landmark
 * Provides site-wide footer information and copyright
 */
export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="border-t border-border/40 bg-background/95 py-6 mt-auto"
    >
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>
          © {currentYear} {t('app.title')}. {t('footer.rights')}
        </p>
        {/* <p className="mt-2 text-xs">
          {t('footer.disclaimer')}
        </p> */}
      </div>
    </footer>
  );
}

export default Footer;
