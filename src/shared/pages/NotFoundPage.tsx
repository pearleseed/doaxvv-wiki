import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "@/shared/hooks/useTranslation";

const NotFoundPage = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main
      id="main-content"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted to-background"
      tabIndex={-1}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-secondary/10 blur-3xl animate-float [animation-delay:1s]" />
        <div className="absolute left-1/2 top-1/4 h-48 w-48 rounded-full bg-accent/10 blur-3xl animate-float [animation-delay:2s]" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-lg px-6 text-center animate-fade-in">
        {/* 404 Number with gradient */}
        <div className="relative mb-6">
          <span className="text-[10rem] font-bold leading-none tracking-tighter bg-gradient-ocean bg-clip-text text-transparent select-none sm:text-[12rem]">
            404
          </span>
        </div>

        {/* Message */}
        <h1 className="mb-3 text-2xl font-semibold text-foreground sm:text-3xl">
          {t('notFound.title')}
        </h1>
        <p className="mb-8 text-muted-foreground">
          {t('notFound.description')}
        </p>

        {/* Action buttons */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              {t('notFound.backHome')}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link to="/search">
              <Search className="mr-2 h-4 w-4" />
              {t('notFound.search')}
            </Link>
          </Button>
        </div>

        {/* Browser back link */}
        <button
          onClick={() => window.history.back()}
          className="mt-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
        >
          <ArrowLeft className="h-3 w-3" />
          {t('notFound.goBack')}
        </button>

        {/* Attempted path info */}
        <p className="mt-8 text-xs text-muted-foreground/60">
          {t('notFound.attemptedPath')} <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{location.pathname}</code>
        </p>
      </div>
    </main>
  );
};

export default NotFoundPage;
