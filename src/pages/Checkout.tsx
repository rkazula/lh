import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Package, Loader2, Navigation, AlertCircle, Tag, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore, useToastStore } from '@/lib/store';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ANIMATION_VARIANTS } from '@/lib/constants';

interface InPostPoint {
    name: string;
    address: {
        line1: string;
        line2: string;
    };
    location: {
        latitude: number;
        longitude: number;
    };
    distance?: number;
}

// Zestaw przykładowych punktów InPost (z możliwością wpisania dowolnego własnego kodu Paczkomatu)
const MOCK_INPOST_POINTS: InPostPoint[] = [
    { name: 'WAW123M', address: { line1: 'ul. Marszałkowska 100', line2: '00-001 Warszawa' }, location: { latitude: 52.2297, longitude: 21.0122 } },
    { name: 'WAW456A', address: { line1: 'ul. Aleje Jerozolimskie 50', line2: '00-024 Warszawa' }, location: { latitude: 52.2260, longitude: 21.0030 } },
    { name: 'WAW789B', address: { line1: 'ul. Żelazna 32', line2: '00-832 Warszawa' }, location: { latitude: 52.2320, longitude: 20.9950 } },
    { name: 'KRK001A', address: { line1: 'ul. Floriańska 15', line2: '31-019 Kraków' }, location: { latitude: 50.0647, longitude: 19.9450 } },
    { name: 'KRK002B', address: { line1: 'ul. Dietla 78', line2: '31-073 Kraków' }, location: { latitude: 50.0550, longitude: 19.9400 } },
    { name: 'GDA001C', address: { line1: 'ul. Długa 45', line2: '80-827 Gdańsk' }, location: { latitude: 54.3520, longitude: 18.6466 } },
    { name: 'POZ001D', address: { line1: 'ul. Półwiejska 20', line2: '61-888 Poznań' }, location: { latitude: 52.4064, longitude: 16.9252 } },
    { name: 'WRO001E', address: { line1: 'ul. Świdnicka 8', line2: '50-067 Wrocław' }, location: { latitude: 51.1079, longitude: 17.0385 } },
    { name: 'LOD001F', address: { line1: 'ul. Piotrkowska 120', line2: '90-006 Łódź' }, location: { latitude: 51.7687, longitude: 19.4560 } },
    { name: 'KAT001G', address: { line1: 'ul. 3 Maja 30', line2: '40-096 Katowice' }, location: { latitude: 50.2599, longitude: 19.0199 } },
];

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const FREE_SHIPPING_THRESHOLD = 300;

const Checkout: React.FC = () => {
    const { items, getTotalPrice } = useCartStore();
    const { addToast } = useToastStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedPoint, setSelectedPoint] = useState<InPostPoint | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [sortedPoints, setSortedPoints] = useState<InPostPoint[]>(MOCK_INPOST_POINTS);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Obsługa kodu rabatowego
    const [discountCodeInput, setDiscountCodeInput] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);

    useEffect(() => {
        if (searchParams.get('canceled') === 'true') {
            addToast('Płatność została anulowana. Twoje produkty nadal czekają w koszyku.', 'error');
        }
    }, [searchParams, addToast]);

    useEffect(() => {
        // Jeśli koszyk jest pusty i nie wracamy z anulowanej płatności, przejdź do katalogu
        if (items.length === 0 && searchParams.get('canceled') !== 'true') {
            navigate('/catalog');
        }
    }, [items, navigate, searchParams]);

    const getGeolocation = useCallback(() => {
        setIsLoadingLocation(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });

                    const pointsWithDistance = MOCK_INPOST_POINTS.map(point => ({
                        ...point,
                        distance: calculateDistance(latitude, longitude, point.location.latitude, point.location.longitude)
                    }));

                    pointsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
                    setSortedPoints(pointsWithDistance);
                    setIsLoadingLocation(false);
                    addToast('Znaleziono Twoją lokalizację. Punkty posortowane.', 'success');
                },
                (error) => {
                    console.warn('Geolocation warning:', error.message);
                    setIsLoadingLocation(false);
                    addToast('Nie udało się pobrać lokalizacji — wpisz miasto lub kod ręcznie', 'error');
                },
                { timeout: 8000 }
            );
        } else {
            setIsLoadingLocation(false);
            addToast('Twoja przeglądarka nie wspiera geolokalizacji', 'error');
        }
    }, [addToast]);

    const filteredPoints = sortedPoints.filter(point =>
        point.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        point.address.line1.toLowerCase().includes(searchQuery.toLowerCase()) ||
        point.address.line2.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleApplyDiscount = (e: React.FormEvent) => {
        e.preventDefault();
        const code = discountCodeInput.trim().toUpperCase();
        if (!code) return;

        if (code === 'SILENCE10') {
            setAppliedDiscount({ code: 'SILENCE10', percent: 10 });
            addToast('Kod rabatowy 10% został pomyślnie naliczony!', 'success');
            setDiscountCodeInput('');
        } else {
            addToast('Wprowadzony kod rabatowy jest nieprawidłowy', 'error');
        }
    };

    const handleSelectCustomPoint = () => {
        const cleanCode = searchQuery.trim().toUpperCase();
        if (cleanCode.length < 3) {
            addToast('Wprowadź prawidłowy identyfikator paczkomatu (np. KRA01M)', 'error');
            return;
        }

        const customPoint: InPostPoint = {
            name: cleanCode,
            address: {
                line1: `Paczkomat ${cleanCode}`,
                line2: formData.address || 'Polska',
            },
            location: { latitude: 52.0, longitude: 20.0 },
        };
        setSelectedPoint(customPoint);
        if (errors.point) setErrors(prev => ({ ...prev, point: '' }));
        addToast(`Wybrano Paczkomat: ${cleanCode}`, 'success');
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim() || formData.name.trim().length < 3) {
            newErrors.name = 'Podaj pełne imię i nazwisko (min. 3 znaki)';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
            newErrors.email = 'Wprowadź prawidłowy adres e-mail';
        }

        // Telefon jest bezwzględnie wymagany przez InPost do powiadomień SMS o odbiorze
        const phoneDigits = formData.phone.replace(/[\s+-]/g, '');
        if (!formData.phone.trim() || phoneDigits.length < 9) {
            newErrors.phone = 'Numer telefonu jest wymagany do odbioru w Paczkomacie (min. 9 cyfr)';
        }

        if (!formData.address.trim() || formData.address.trim().length < 5) {
            newErrors.address = 'Podaj poprawny adres zamieszkania / rozliczeniowy (ulica, kod, miasto)';
        }

        if (!selectedPoint) {
            newErrors.point = 'Wybierz Paczkomat InPost do odbioru przesyłki';
        }

        if (!acceptedTerms) {
            newErrors.terms = 'Musisz zaakceptować Regulamin i Politykę Prywatności, aby sfinalizować zamówienie';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            addToast('Uzupełnij poprawnie wszystkie wymagane pola formularza', 'error');
            return;
        }

        if (!selectedPoint) {
            addToast('Proszę wybrać punkt odbioru InPost', 'error');
            return;
        }

        setIsProcessing(true);

        try {
            const { data, error } = await supabase.functions.invoke('create-checkout', {
                body: {
                    items: items.map(item => ({
                        variantId: item.variantId,
                        productId: item.productId,
                        name: item.name,
                        variantName: item.variantName,
                        price: item.price,
                        image: item.image,
                        quantity: Math.max(1, Math.floor(item.quantity)),
                    })),
                    customerEmail: formData.email.trim().toLowerCase(),
                    customerName: formData.name.trim(),
                    customerPhone: formData.phone.trim(),
                    shippingAddress: formData.address.trim(),
                    inpostPointId: selectedPoint.name,
                    inpostPointName: selectedPoint.name,
                    inpostPointAddress: `${selectedPoint.address.line1}, ${selectedPoint.address.line2}`,
                    discountCode: appliedDiscount?.code || null,
                },
            });

            if (error) {
                throw error;
            }

            // Bezpieczna walidacja adresu URL przekierowania (ochrona przed Open Redirect i HTTP MitM)
            if (data?.url && typeof data.url === 'string') {
                const parsedUrl = new URL(data.url);
                const isTrustedProtocol = parsedUrl.protocol === 'https:';
                const isTrustedDomain =
                    parsedUrl.hostname === 'checkout.stripe.com' ||
                    parsedUrl.hostname.endsWith('.stripe.com') ||
                    parsedUrl.origin === window.location.origin;

                if (isTrustedProtocol && isTrustedDomain) {
                    // UWAGA: Koszyka NIE czyścimy tutaj! Zostanie wyczyszczony dopiero na stronie sukcesu /order-confirmation/:orderId
                    // Dzięki temu, jeśli użytkownik anuluje na Stripe, nie traci produktów.
                    window.location.href = data.url;
                } else {
                    throw new Error('Niezaufana domena bramki płatności lub brak szyfrowania HTTPS');
                }
            } else {
                throw new Error('Brak adresu przekierowania do płatności');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            addToast('Nie udało się utworzyć sesji płatności. Spróbuj ponownie lub skontaktuj się z nami.', 'error');
            setIsProcessing(false);
        }
    };

    const subtotal = getTotalPrice();
    const discountAmount = appliedDiscount ? Math.round((subtotal * appliedDiscount.percent) / 100) : 0;
    const discountedSubtotal = subtotal - discountAmount;

    // Poprawne wyliczenie darmowej dostawy powyżej 300 zł
    const isFreeShipping = discountedSubtotal >= FREE_SHIPPING_THRESHOLD;
    const shipping = selectedPoint ? (isFreeShipping ? 0 : 14.99) : 0;
    const total = discountedSubtotal + shipping;

    const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - discountedSubtotal);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
        }).format(price);
    };

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center tracking-tight">Finalizacja Zamówienia</h1>

                <form id="checkout-form" onSubmit={handleSubmit} noValidate>
                    <div className="grid lg:grid-cols-2 gap-8 items-start">
                        {/* Left Column - Form */}
                        <div className="space-y-6">
                            {/* Customer Info */}
                            <Card className="glass">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="w-5 h-5 text-primary" />
                                        Dane do wysyłki i faktury
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Imię i nazwisko *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Jan Kowalski"
                                            required
                                            aria-invalid={!!errors.name}
                                            className={errors.name ? 'border-destructive' : ''}
                                        />
                                        {errors.name && (
                                            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="email">Adres e-mail *</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="jan@example.com"
                                            required
                                            aria-invalid={!!errors.email}
                                            className={errors.email ? 'border-destructive' : ''}
                                        />
                                        {errors.email && (
                                            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="phone">Numer telefonu (wymagany do kodu SMS Paczkomatu) *</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+48 123 456 789"
                                            required
                                            aria-invalid={!!errors.phone}
                                            className={errors.phone ? 'border-destructive' : ''}
                                        />
                                        {errors.phone && (
                                            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="address">Adres zamieszkania / rozliczeniowy *</Label>
                                        <Input
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="ul. Przykładowa 1/2, 00-001 Warszawa"
                                            required
                                            aria-invalid={!!errors.address}
                                            className={errors.address ? 'border-destructive' : ''}
                                        />
                                        {errors.address && (
                                            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                {errors.address}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* InPost Point Selection */}
                            <Card className="glass">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        Wybierz Paczkomat InPost *
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Szukaj po kodzie lub ulicy (np. WAW, Floriańska)..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={getGeolocation}
                                            disabled={isLoadingLocation}
                                            aria-label="Użyj geolokalizacji"
                                        >
                                            {isLoadingLocation ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Navigation className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>

                                    {userLocation && (
                                        <p className="text-xs text-muted-foreground">
                                            📍 Punkty posortowane wg odległości od Twojej lokalizacji
                                        </p>
                                    )}

                                    {errors.point && (
                                        <p className="text-xs text-destructive flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            {errors.point}
                                        </p>
                                    )}

                                    {/* Preview banner */}
                                    <div className="p-3 bg-secondary/50 rounded-xl border border-border text-sm flex items-center justify-between">
                                        <div>
                                            <span className="text-xs text-muted-foreground block">Wybrany Paczkomat:</span>
                                            {selectedPoint ? (
                                                <span className="font-semibold text-primary">{selectedPoint.name} — {selectedPoint.address.line1}</span>
                                            ) : (
                                                <span className="text-muted-foreground italic">Nie wybrano punktu odbioru</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Points List */}
                                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                                        {filteredPoints.length > 0 ? (
                                            filteredPoints.map((point) => (
                                                <button
                                                    key={point.name}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedPoint(point);
                                                        if (errors.point) setErrors(prev => ({ ...prev, point: '' }));
                                                    }}
                                                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                                                        selectedPoint?.name === point.name
                                                            ? 'border-primary bg-primary/10 shadow-sm'
                                                            : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <strong className="text-foreground text-sm">{point.name}</strong>
                                                            <p className="text-xs text-muted-foreground">
                                                                {point.address.line1}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground/80">
                                                                {point.address.line2}
                                                            </p>
                                                        </div>
                                                        {point.distance !== undefined && (
                                                            <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                                                                {point.distance.toFixed(1)} km
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 space-y-2">
                                                <p className="text-xs text-muted-foreground">
                                                    Nie znaleziono punktu w liście podręcznej.
                                                </p>
                                                {searchQuery.trim().length >= 3 && (
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={handleSelectCustomPoint}
                                                    >
                                                        Użyj kodu &quot;{searchQuery.trim().toUpperCase()}&quot; jako Paczkomat
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Terms and Privacy Checkbox (Legal requirement) */}
                            <Card className="glass border-dashed">
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            checked={acceptedTerms}
                                            onChange={(e) => {
                                                setAcceptedTerms(e.target.checked);
                                                if (errors.terms) setErrors(prev => ({ ...prev, terms: '' }));
                                            }}
                                            className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                                        />
                                        <Label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                                            Oświadczam, że zapoznałem/am się i akceptuję{' '}
                                            <Link to="/terms" target="_blank" className="text-foreground underline hover:text-primary">
                                                Regulamin Sklepu
                                            </Link>{' '}
                                            oraz{' '}
                                            <Link to="/privacy" target="_blank" className="text-foreground underline hover:text-primary">
                                                Politykę Prywatności
                                            </Link>
                                            . Potwierdzam, że zamówienie wiąże się z obowiązkiem zapłaty. *
                                        </Label>
                                    </div>
                                    {errors.terms && (
                                        <p className="text-xs text-destructive flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            {errors.terms}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div>
                            <Card className="glass sticky top-24">
                                <CardHeader>
                                    <CardTitle>Podsumowanie zamówienia</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Items */}
                                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                                        {items.map((item) => (
                                            <div key={item.variantId} className="flex gap-3 items-center">
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground">{item.variantName}</p>
                                                    <p className="text-xs">
                                                        {item.quantity} x {formatPrice(item.price)}
                                                    </p>
                                                </div>
                                                <span className="font-semibold text-sm">
                                                    {formatPrice(item.price * item.quantity)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Promo Code Input */}
                                    <div className="border-t border-border pt-4">
                                        {appliedDiscount ? (
                                            <div className="flex items-center justify-between p-2.5 bg-green-500/10 border border-green-500/20 rounded-xl text-xs">
                                                <div className="flex items-center gap-2 text-green-600 font-medium">
                                                    <Check className="w-4 h-4" />
                                                    Aktywny kod: <strong>{appliedDiscount.code}</strong> (-{appliedDiscount.percent}%)
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setAppliedDiscount(null)}
                                                    className="text-muted-foreground hover:text-destructive underline"
                                                >
                                                    Usuń
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Kod rabatowy (np. SILENCE10)..."
                                                        value={discountCodeInput}
                                                        onChange={(e) => setDiscountCodeInput(e.target.value)}
                                                        className="pl-9 text-xs"
                                                    />
                                                </div>
                                                <Button type="button" variant="outline" size="sm" onClick={handleApplyDiscount}>
                                                    Zastosuj
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Free shipping banner */}
                                    {isFreeShipping ? (
                                        <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl text-xs text-primary flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 flex-shrink-0" />
                                            <span>Gratulacje! Twoje zamówienie kwalifikuje się na <strong>darmową dostawę</strong>.</span>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-muted-foreground text-center">
                                            Dodaj produkty za jeszcze <strong className="text-foreground">{formatPrice(amountNeededForFreeShipping)}</strong>, aby otrzymać darmową dostawę!
                                        </div>
                                    )}

                                    <div className="border-t border-border pt-4 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Produkty</span>
                                            <span>{formatPrice(subtotal)}</span>
                                        </div>
                                        {appliedDiscount && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Rabat ({appliedDiscount.code})</span>
                                                <span>-{formatPrice(discountAmount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Dostawa InPost</span>
                                            <span>
                                                {selectedPoint
                                                    ? isFreeShipping
                                                        ? <strong className="text-green-500">GRATIS</strong>
                                                        : formatPrice(shipping)
                                                    : 'Wybierz punkt'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                                            <span>Do zapłaty</span>
                                            <span className="text-primary">{formatPrice(total)}</span>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        form="checkout-form"
                                        className="w-full h-12 text-base font-semibold rounded-xl"
                                        size="lg"
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                Inicjowanie płatności...
                                            </>
                                        ) : (
                                            `Zapłać ${formatPrice(total)}`
                                        )}
                                    </Button>

                                    <p className="text-xs text-center text-muted-foreground leading-relaxed">
                                        🔒 Bezpieczna płatność obsługiwana przez Stripe. Szyfrowanie SSL.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
