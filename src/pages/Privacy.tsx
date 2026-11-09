import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ANIMATION_VARIANTS } from '@/lib/constants';

export default function Privacy() {
  return (
    <motion.div
      initial={ANIMATION_VARIANTS.pageInitial}
      animate={ANIMATION_VARIANTS.pageAnimate}
      exit={ANIMATION_VARIANTS.pageExit}
      transition={{ duration: 0.4 }}
      className="min-h-screen py-12"
    >
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Polityka Prywatności</h1>
          <p className="text-sm text-muted-foreground">Ostatnia aktualizacja: Listopad 2026</p>
        </div>

        <Card className="glass">
          <CardContent className="pt-6 space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">1. Informacje Ogólne i Administrator Danych</h2>
              <p>
                Administratorem danych osobowych zbieranych za pośrednictwem sklepu internetowego Local Haters jest Local Haters Sp. z o.o. z siedzibą w Łodzi, ul. Piotrkowska 120. Dbamy o bezpieczeństwo Twoich danych osobowych zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO).
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">2. Cel Przetwarzania Danych</h2>
              <p>Dane osobowe zbierane są w celach:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Realizacji zamówienia i wysyłki towaru przez operatora InPost.</li>
                <li>Przetworzenia płatności bezgotówkowych przez certyfikowanego operatora Stripe.</li>
                <li>Wysyłki newslettera (wyłącznie po wyrażeniu dobrowolnej zgody).</li>
                <li>Realizacji praw konsumenckich (zwroty, reklamacje).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">3. Odbiorcy Danych</h2>
              <p>
                Twoje dane mogą być przekazywane wyłącznie podmiotom niezbędnym do wykonania umowy kupna: firmom kurierskim (InPost S.A.), operatorom płatności elektronicznych (Stripe Payments Europe, Ltd.) oraz dostawcom hostingu i baz danych (Supabase).
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-2">4. Prawa Użytkownika</h2>
              <p>
                Każdej osobie przysługuje prawo dostępu do swoich danych, sprostowania, usunięcia (&quot;prawo do bycia zapomnianym&quot;), ograniczenia przetwarzania oraz wniesienia sprzeciwu. W celu realizacji praw skontaktuj się z nami: <strong className="text-foreground">kontakt@localhaters.com</strong>.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
