import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Calendar, Sparkles, BookOpen, ChevronRight } from "lucide-react";
import { contentLoader } from "@/content";
import type { Event, Guide, Swimsuit } from "@/content";
import { useTranslation } from "@/shared/hooks/useTranslation";

/**
 * Parse date string or Date object to comparable timestamp
 */
function getDateTimestamp(date: Date | string | undefined): number {
  if (!date) return 0;
  if (date instanceof Date) return date.getTime();
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

const WhatsNew = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [swimsuits, setSwimsuits] = useState<Swimsuit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      setIsLoading(true);
      await contentLoader.initialize();
      setEvents(contentLoader.getEvents());
      setGuides(contentLoader.getGuides());
      setSwimsuits(contentLoader.getSwimsuits());
      setIsLoading(false);
    }
    loadContent();
  }, []);

  // Sort and get latest items based on their respective date fields
  const latestEvent = useMemo(() => {
    if (events.length === 0) return null;
    // Sort by start_date (most recent first), then by updated_at as fallback
    return [...events].sort((a, b) => {
      const dateA = getDateTimestamp(a.start_date) || getDateTimestamp(a.updated_at);
      const dateB = getDateTimestamp(b.start_date) || getDateTimestamp(b.updated_at);
      return dateB - dateA;
    })[0];
  }, [events]);

  const latestGuide = useMemo(() => {
    if (guides.length === 0) return null;
    // Sort by updated_at (most recent first)
    return [...guides].sort((a, b) => {
      const dateA = getDateTimestamp(a.updated_at);
      const dateB = getDateTimestamp(b.updated_at);
      return dateB - dateA;
    })[0];
  }, [guides]);

  const latestSwimsuit = useMemo(() => {
    if (swimsuits.length === 0) return null;
    // Sort by updated_at (most recent first)
    return [...swimsuits].sort((a, b) => {
      const dateA = getDateTimestamp(a.updated_at);
      const dateB = getDateTimestamp(b.updated_at);
      return dateB - dateA;
    })[0];
  }, [swimsuits]);

  // Build updates array only when we have data
  const updates = useMemo(() => {
    const items = [];

    if (latestEvent) {
      items.push({
        icon: Calendar,
        title: latestEvent.title,
        description: latestEvent.type,
        image: latestEvent.image,
        link: `/events/${latestEvent.unique_key}`,
        badge: t('home.whatsNew.event')
      });
    }

    if (latestSwimsuit) {
      items.push({
        icon: Sparkles,
        title: latestSwimsuit.title,
        description: `${latestSwimsuit.rarity} - ${latestSwimsuit.character}`,
        image: latestSwimsuit.image,
        link: `/swimsuits/${latestSwimsuit.unique_key}`,
        badge: t('home.whatsNew.swimsuit')
      });
    }

    if (latestGuide) {
      items.push({
        icon: BookOpen,
        title: latestGuide.title,
        description: latestGuide.difficulty ? `${latestGuide.difficulty} • ${latestGuide.read_time}` : latestGuide.category,
        image: latestGuide.image,
        link: `/guides/${latestGuide.unique_key}`,
        badge: t('home.whatsNew.guide')
      });
    }

    return items;
  }, [latestEvent, latestSwimsuit, latestGuide, t]);

  // Don't render if loading or no updates available
  if (isLoading) {
    return (
      <section className="animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">{t('home.whatsNew.title')}</h2>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden border-border/50 bg-card">
              <div className="flex gap-3 p-3">
                <div className="w-20 h-20 rounded-lg bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (updates.length === 0) {
    return null;
  }

  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">{t('home.whatsNew.title')}</h2>
        </div>
        <Link to="/events">
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            {t('home.viewAll')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {updates.map((update, index) => {
          const Icon = update.icon;
          return (
            <Link key={index} to={update.link}>
              <Card 
                className="group cursor-pointer overflow-hidden border-border/50 bg-card shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex gap-3 p-3">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={update.image} 
                      alt={update.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 rounded-md bg-primary/10">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground">{update.badge}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                      {update.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {update.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default WhatsNew;
