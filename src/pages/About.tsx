import { motion } from 'framer-motion';
import { Leaf, Heart, Shield, Users } from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: Leaf,
      title: 'Zrównoważona produkcja',
      description: 'Wszystkie nasze produkty wykonane są z organicznych materiałów, z poszanowaniem środowiska naturalnego.',
    },
    {
      icon: Heart,
      title: 'Pasja do detali',
      description: 'Każdy produkt jest starannie zaprojektowany z uwagą na najdrobniejsze szczegóły.',
    },
    {
      icon: Shield,
      title: 'Jakość bez kompromisów',
      description: 'Używamy tylko najwyższej jakości tkanin i materiałów, które przetrwają lata użytkowania.',
    },
    {
      icon: Users,
      title: 'Społeczność',
      description: 'Budujemy społeczność ludzi, którzy cenią ciszę, jakość i minimalizm.',
    },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            O Local Haters
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Jesteśmy marką streetwear stworzoną przez i dla introwertyków. 
            Wierzymy, że prawdziwa siła płynie z ciszy, a minimalizm jest 
            najwyższą formą luksusu.
          </p>
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20"
        >
          <div className="aspect-square rounded-3xl bg-secondary overflow-hidden">
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-6xl font-bold tracking-tighter opacity-20">LH</span>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Nasza historia</h2>
            <p className="text-muted-foreground leading-relaxed">
              Local Haters powstało z prostej obserwacji: w świecie pełnym hałasu 
              i nadmiaru, brakowało marki, która celebrowałaby ciszę i prostotę.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Zaczęliśmy w 2023 roku od małego studia w Warszawie, tworząc ubrania 
              dla siebie i przyjaciół. Dziś nasza społeczność liczy tysiące osób, 
              które podzielają naszą filozofię — mniej znaczy więcej.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Każdy nasz produkt jest wynikiem miesięcy pracy nad designem, 
              doborem materiałów i testowaniem. Nie śpieszymy się. Nie gonimy trendów. 
              Tworzymy rzeczy, które mają sens.
            </p>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
            Nasze wartości
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center max-w-2xl mx-auto py-16 border-t border-b border-border"
        >
          <blockquote className="text-2xl md:text-3xl font-light italic text-muted-foreground">
            "Cisza jest najgłośniejszym krzykiem."
          </blockquote>
          <p className="mt-4 text-sm text-muted-foreground">— Filozofia Local Haters</p>
        </motion.div>
      </div>
    </div>
  );
}
