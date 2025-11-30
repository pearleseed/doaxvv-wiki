import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ChevronRight, BookOpen } from "lucide-react";
import { contentLoader } from "@/content";
import type { Guide } from "@/content";
import { DatasetImage } from "@/shared/components";

const PopularGuides = () => {
  const [popularGuides, setPopularGuides] = useState<Guide[]>([]);

  useEffect(() => {
    async function loadContent() {
      await contentLoader.initialize();
      setPopularGuides(contentLoader.getGuides().slice(0, 3));
    }
    loadContent();
  }, []);

  return (
    <section className="px-4 md:px-8 mt-12 mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-foreground">Popular Guides</h2>
        <Link to="/guides">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {popularGuides.map((guide) => {
          return (
            <Link key={guide.id} to={`/guides/${guide.unique_key}`}>
              <Card 
                className="group cursor-pointer overflow-hidden border-border/50 bg-card shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-video overflow-hidden relative">
                  <DatasetImage 
                    src={guide.image} 
                    alt={guide.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="p-3 rounded-lg bg-background/90 backdrop-blur">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {guide.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {guide.summary}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default PopularGuides;
