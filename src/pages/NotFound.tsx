import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("404: Nieznaleziona trasa:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="text-center px-4 max-w-md">
        <span className="text-8xl font-extrabold tracking-tighter text-primary/40 block mb-2">404</span>
        <h1 className="mb-3 text-2xl md:text-3xl font-bold">Strona nie została odnaleziona</h1>
        <p className="mb-8 text-muted-foreground text-sm leading-relaxed">
          Strona, której szukasz, mogła zostać przeniesiona lub usunięta.
        </p>
        <Button asChild size="lg" className="rounded-full px-8">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Wróć do strony głównej
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
