import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Clock } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ChevronRight } from "lucide-react";
import { contentLoader } from "@/content";
import type { Event } from "@/content";
import { DatasetImage } from "@/shared/components";

const CurrentEvents = () => {
  const [time, setTime] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    async function loadContent() {
      await contentLoader.initialize();
      const allEvents = contentLoader.getEvents();
      setEvents(allEvents.filter(e => e.event_status === "Active").slice(0, 2));
    }
    loadContent();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateTimeLeft = (endDate: Date | string) => {
    const eventDate = endDate instanceof Date ? endDate : new Date(endDate);
    const difference = eventDate.getTime() - time.getTime();
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <section className="px-4 md:px-8 mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-foreground">Current Events</h2>
        <Link to="/events">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <Link key={event.id} to={`/events/${event.unique_key}`}>
            <Card 
              className="group cursor-pointer overflow-hidden border-border/50 bg-card shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-video overflow-hidden relative">
                <DatasetImage 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
                  {event.type}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {event.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Ends in {calculateTimeLeft(event.end_date)}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CurrentEvents;
