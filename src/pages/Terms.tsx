import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Terms() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Regulamin Sklepu</h1>
          <p className="text-sm text-muted-foreground">Wersja obowiązująca od listopada 2026 r.</p>
        </div>

        <Card className="glass">
          <CardContent className="pt-6 space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">§ 1. Postanowienia wstępne</h2>
              <p>
                Niniejszy regulamin określa zasady korzystania ze sklepu internetowego Local Haters, składania zamówień na produkty, uiszczania ceny sprzedaży oraz realizacji uprawnień konsumenckich.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">§ 2. Składanie i realizacja zamówień</h2>
              <p>
                1. Zamówienia można składać przez całą dobę za pośrednictwem strony internetowej sklepu.<br />
                2. Do zawarcia umowy sprzedaży dochodzi w momencie zatwierdzenia zamówienia i pomyślnej autoryzacji płatności.<br />
                3. Wszystkie ceny w sklepie podawane są w złotych polskich (PLN) i zawierają należne podatki (ceny brutto).
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">§ 3. Płatności i dostawa</h2>
              <p>
                1. Płatności realizowane są za pośrednictwem bezpiecznej bramki Stripe (karty płatnicze, BLIK, Apple Pay, Google Pay).<br />
                2. Dostawa realizowana jest na terytorium Polski za pośrednictwem Paczkomatów InPost.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">§ 4. Odstąpienie od umowy i zwroty</h2>
              <p>
                Konsument ma prawo odstąpić od umowy bez podania przyczyny w terminie 30 dni od objęcia towaru w posiadanie. Towar nie może nosić śladów użytkowania i musi posiadać oryginalne metki.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
