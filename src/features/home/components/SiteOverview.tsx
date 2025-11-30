import { useState, useEffect } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Users, Shirt, Calendar, BookOpen, Target, TrendingUp } from "lucide-react";
import { contentLoader } from "@/content";
import { useTranslation } from "@/shared/hooks/useTranslation";

const STATS_CONFIG = [
  { key: "characters", icon: Users, color: "text-primary" },
  { key: "swimsuits", icon: Shirt, color: "text-primary" },
  { key: "activeEvents", icon: Calendar, color: "text-primary" },
  { key: "guides", icon: BookOpen, color: "text-primary" },
];

const SiteOverview = () => {
  const { t } = useTranslation();
  const [statsValues, setStatsValues] = useState({
    characters: 0,
    swimsuits: 0,
    activeEvents: 0,
    guides: 0,
  });

  useEffect(() => {
    async function loadContent() {
      await contentLoader.initialize();
      const characters = contentLoader.getCharacters();
      const swimsuits = contentLoader.getSwimsuits();
      const events = contentLoader.getEvents();
      const guides = contentLoader.getGuides();
      const activeEvents = events.filter(e => e.event_status === "Active").length;

      setStatsValues({
        characters: characters.length,
        swimsuits: swimsuits.length,
        activeEvents: activeEvents,
        guides: guides.length,
      });
    }
    loadContent();
  }, []);

  return (
    <section className="animate-fade-in">
      <Card className="border-border/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-card overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {t('home.overview.title')}
              </h2>
              <p className="text-muted-foreground mb-4 max-w-2xl">
                {t('home.overview.desc')}
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Target className="h-4 w-4 text-primary" />
                  {t('home.overview.updatedDaily')}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {t('home.overview.communityDriven')}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {STATS_CONFIG.map((stat, index) => (
                <div 
                  key={stat.key} 
                  className="text-center p-4 rounded-xl bg-background/50 backdrop-blur border border-border/30"
                >
                  <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold text-foreground">
                    {statsValues[stat.key as keyof typeof statsValues]}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t(`home.stats.${stat.key}`)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default SiteOverview;
