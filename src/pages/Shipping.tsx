import { motion } from 'framer-motion';
import { Truck, RotateCcw, ShieldCheck, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ANIMATION_VARIANTS } from '@/lib/constants';

export default function Shipping() {
  return (
    <motion.div
      initial={ANIMATION_VARIANTS.pageInitial}
      animate={ANIMATION_VARIANTS.pageAnimate}
      exit={ANIMATION_VARIANTS.pageExit}
      transition={{ duration: 0.4 }}
      className="min-h-screen py-12"
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Dostawa i zwroty</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Wszystko co musisz wiedzieć o wysyłce zamówień, kosztach dostawy oraz procedurze zwrotu.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                Dostawa Paczkomaty InPost
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Koszt:</strong> 14,99 zł (Darmowa od 300 zł)</p>
              <p><strong className="text-foreground">Czas realizacji:</strong> 24-48 godzin w dni robocze</p>
              <p>Paczka trafia do wybranego przez Ciebie Paczkomatu InPost. Kod odbioru oraz kod QR otrzymasz w aplikacji InPost oraz wiadomości SMS/e-mail.</p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-primary" />
                Zwroty do 30 dni
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Czas na zwrot:</strong> 30 dni kalendarzowych</p>
              <p><strong className="text-foreground">Warunek:</strong> Produkt w stanie nienaruszonym z kompletem metek</p>
              <p>Zwrotu możesz dokonać szybko i bez pytań. Środki zwracamy tą samą metodą płatności w ciągu 3-5 dni roboczych od otrzymania paczki.</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <Card className="glass">
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Jak przebiega realizacja zamówienia?
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Po opłaceniu zamówienia otrzymujesz automatyczne potwierdzenie e-mail z numerem zamówienia.</li>
                <li>Zamówienie pakowane jest w biodegradowalne opakowania w naszym magazynie w Łodzi.</li>
                <li>W momencie nadania paczki otrzymujesz powiadomienie ze statusem wysyłki.</li>
                <li>Możesz na bieżąco sprawdzać status na naszej podstronie <strong className="text-foreground">Śledź zamówienie</strong>.</li>
              </ol>

              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 pt-4">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Reklamacje i wymiany
              </h3>
              <p className="text-sm">
                Jeśli otrzymany produkt posiada wadę fabryczną lub niewłaściwy rozmiar, skontaktuj się z nami pod adresem <strong className="text-foreground">kontakt@localhaters.com</strong>, podając numer zamówienia. Zapewniamy bezpłatną wymianę lub pełny zwrot kosztów.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
