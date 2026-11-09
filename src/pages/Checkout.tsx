import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Package, Loader2, Navigation, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore, useToastStore } from '@/lib/store';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

// Zestaw punktów InPost (wersja demonstracyjna z możliwością rozszerzenia o API InPost ShipX)
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
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

const Checkout: React.FC = () => {
    const { items, getTotalPrice, clearCart } = useCartStore();
    const { addToast } = useToastStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedPoint, setSelectedPoint] = useState<InPostPoint | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [sortedPoints, setSortedPoints] = useState<InPostPoint[]>(MOCK_INPOST_POINTS);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (searchParams.get('canceled') === 'true') {
            addToast('Płatność została anulowana. Możesz spróbować ponownie.', 'error');
        }
    }, [searchParams, addToast]);

    useEffect(() => {
        if (items.length === 0) {
            navigate('/catalog');
        }
    }, [items, navigate]);

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
                    addToast('Nie udało się pobrać lokalizacji — wpisz miasto ręcznie', 'error');
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

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim() || formData.name.trim().length < 3) {
            newErrors.name = 'Podaj pełne imię i nazwisko (min. 3 znaki)';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
            newErrors.email = 'Wprowadź prawidłowy adres e-mail';
        }

        if (formData.phone.trim()) {
            const phoneDigits = formData.phone.replace(/[\s+-]/g, '');
            if (phoneDigits.length < 9) {
                newErrors.phone = 'Numer telefonu musi mieć co najmniej 9 cyfr';
            }
        }

        if (!formData.address.trim() || formData.address.trim().length < 5) {
            newErrors.address = 'Podaj poprawny adres rozliczeniowy (ulica, kod, miasto)';
        }

        if (!selectedPoint) {
            newErrors.point = 'Wybierz Paczkomat InPost do odbioru przesyłki';
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
                    customerPhone: formData.phone.trim() || null,
                    shippingAddress: formData.address.trim(),
                    inpostPointId: selectedPoint.name,
                    inpostPointName: selectedPoint.name,
                    inpostPointAddress: `${selectedPoint.address.line1}, ${selectedPoint.address.line2}`,
                },
            });

            if (error) {
                throw error;
            }

            // Bezpieczna walidacja adresu URL przekierowania (ochrona przed Open Redirect)
            if (data?.url && typeof data.url === 'string') {
                const parsedUrl = new URL(data.url);
                const isTrustedDomain =
                    parsedUrl.hostname === 'checkout.stripe.com' ||
                    parsedUrl.hostname.endsWith('.stripe.com') ||
                    parsedUrl.origin === window.location.origin;

                if (isTrustedDomain) {
                    clearCart();
                    window.location.href = data.url;
                } else {
                    throw new Error('Niezaufana domena bramki płatności');
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
    const shipping = selectedPoint ? 14.99 : 0;
    const total = subtotal + shipping;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
        }).format(price);
    };

    return (
        <motion.div
            initial={ANIMATION_VARIANTS.pageInitial}
            animate={ANIMATION_VARIANTS.pageAnimate}
            exit={ANIMATION_VARIANTS.pageExit}
            transition={{ duration: 0.4 }}
            className="min-h-screen py-12"
        >
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
                                        <Label htmlFor="phone">Numer telefonu (do powiadomień SMS o paczce)</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+48 123 456 789"
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
                                            placeholder="Szukaj po kodzie lub ulicy..."
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
                                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
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
                                            <p className="text-center text-xs text-muted-foreground py-4">
                                                Nie znaleziono punktu pasującego do &quot;{searchQuery}&quot;
                                            </p>
                                        )}
                                    </div>
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
                                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
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

                                    <div className="border-t border-border pt-4 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Produkty</span>
                                            <span>{formatPrice(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Dostawa InPost</span>
                                            <span>{selectedPoint ? formatPrice(shipping) : 'Wybierz punkt'}</span>
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
        </motion.div>
    );
};

export default Checkout;
