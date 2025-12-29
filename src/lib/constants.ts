import productHoodie from '@/assets/product-hoodie.jpg';
import bad_queen from '@/assets/lh_tshirt_bad_queen.png';
import banana_brain from '@/assets/lh_tshirt_banana_brain.png';
import productJoggers from '@/assets/product-joggers.jpg';
import productJacket from '@/assets/product-jacket.jpg';
import productCap from '@/assets/product-cap.jpg';
import productCrewneck from '@/assets/product-crewneck.jpg';

export const APP_NAME = 'Local Haters';

export const NAVIGATION_LINKS = [
  { label: 'Sklep', href: '/catalog' },
  { label: 'Kolekcje', href: '/collections' },
  { label: 'O Nas', href: '/about' },
];

export const ANIMATION_VARIANTS = {
  pageInitial: { opacity: 0, y: 10, filter: 'blur(10px)' },
  pageAnimate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  pageExit: { opacity: 0, y: -10, filter: 'blur(10px)' },
};

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  sizes: string[];
  colors: string[];
  images: string[];
  badge?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Silence Hoodie',
    slug: 'silence-hoodie',
    price: 349,
    originalPrice: 449,
    description: 'Minimalistyczna bluza z kapturem z premium bawełny. Idealna na ciche dni. Wykonana z 100% organicznej bawełny o gramaturze 400gsm.',
    category: 'Bluzy',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Czarny', 'Szary'],
    images: [productHoodie],
    badge: 'Bestseller',
  },
  {
    id: '2',
    name: 'Local Haters Bad Queen T-shirt',
    slug: 'bad-queen',
    price: 99,
    description: 'Klasyczny t-shirt z delikatnym haftem. 100% organiczna bawełna. Luźny krój oversize dla maksymalnego komfortu.',
    category: 'T-shirty',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Biały', 'Czarny', 'Granat'],
    images: [bad_queen],
    badge: 'Nowa kolekcja!',
  },
  {
    id: '3',
    name: 'Local Haters Banana Brain T-shirt',
    slug: 'banana-brain',
    price: 79,
    description: 'T-shirt Banana Brain. Elastyczny i zabawny. Idealny zarówno do domu jak i na miasto.',
    category: 'T-shirty',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Biały', 'Szary Melanż'],
    images: [banana_brain],
  },
  {
    id: '4',
    name: 'Solitude Jacket',
    slug: 'solitude-jacket',
    price: 599,
    originalPrice: 749,
    description: 'Lekka kurtka bomber z wodoodpornej tkaniny. Dyskretne logo. Idealna na przejściowe pory roku.',
    category: 'Kurtki',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Czarny', 'Oliwkowy'],
    images: [productJacket],
    badge: 'Nowość',
  },
  {
    id: '5',
    name: 'Mindful Cap',
    slug: 'mindful-cap',
    price: 99,
    description: 'Klasyczna czapka z zakrzywionym daszkiem. Regulowany pasek z metalową klamrą. Uniwersalny rozmiar.',
    category: 'Akcesoria',
    sizes: ['One Size'],
    colors: ['Czarny', 'Granat'],
    images: [productCap],
  },
  {
    id: '6',
    name: 'Reflection Crewneck',
    slug: 'reflection-crewneck',
    price: 299,
    description: 'Oversized crewneck z grubej bawełny 380gsm. Subtelny haft na piersi. Idealna na chłodniejsze dni.',
    category: 'Bluzy',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Kremowy', 'Szary', 'Czarny'],
    images: [productCrewneck],
  },
];

export const COLLECTIONS = [
  {
    id: 'silence-2026',
    name: 'Silence 2026',
    description: 'Kolekcja inspirowana ciszą i spokojem. Minimalistyczne formy, premium materiały.',
  },
  {
    id: 'urban-escape',
    name: 'Urban Escape',
    description: 'Streetwear dla tych, którzy szukają ucieczki od miejskiego zgiełku.',
  },
];

export const CATEGORIES = ['Wszystkie', 'Bluzy', 'T-shirty', 'Spodnie', 'Kurtki', 'Akcesoria'];
