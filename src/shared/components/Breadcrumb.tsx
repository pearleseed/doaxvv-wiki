import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useTranslation } from "@/shared/hooks/useTranslation";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  const { t } = useTranslation();
  
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground mb-6 flex-wrap">
      <Link 
        to="/" 
        className="flex items-center gap-1 hover:text-primary transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">{t('nav.home')}</span>
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link 
              to={item.href} 
              className="hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumb;
