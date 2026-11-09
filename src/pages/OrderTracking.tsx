import React, { useState, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, AlertCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
    variantId: string;
    productId: string;
    name: string;
    variantName: string;
    price: number;
    image?: string;
    quantity: number;
}

interface Order {
    id: string;
    order_id: string;
    inpost_point_name: string | null;
    inpost_point_address: string | null;
    items: OrderItem[];
    subtotal: number;
    shipping_cost: number;
    total: number;
    status: string;
    created_at: string;
    paid_at: string | null;
}

const ORDER_STATUSES = [
    { key: 'pending', label: 'Oczekuje na płatność', icon: Clock },
    { key: 'paid', label: 'Opłacone', icon: CheckCircle },
    { key: 'processing', label: 'W realizacji', icon: Package },
    { key: 'shipped', label: 'Wysłane', icon: Truck },
    { key: 'delivered', label: 'Dostarczone', icon: MapPin },
];

const OrderTracking: React.FC = () => {
    const { orderId: urlOrderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState(urlOrderId || '');
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (urlOrderId) {
            setSearchQuery(urlOrderId);
            handleSearch(urlOrderId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlOrderId]);

    const handleSearch = async (overrideId?: string) => {
        const query = (overrideId ?? searchQuery).trim().toUpperCase();
        if (!query) return;

        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const { data, error: fetchError } = await supabase
                .from('orders')
                .select('id, order_id, inpost_point_name, inpost_point_address, items, subtotal, shipping_cost, total, status, created_at, paid_at')
                .eq('order_id', query)
                .maybeSingle();

            if (fetchError || !data) {
                setOrder(null);
                setError('Nie znaleziono zamówienia o podanym numerze');
            } else {
                const orderData: Order = {
                    ...data,
                    items: (Array.isArray(data.items) ? data.items : []) as unknown as OrderItem[],
                };
                setOrder(orderData);
                if (urlOrderId !== data.order_id) {
                    navigate(`/order-tracking/${data.order_id}`, { replace: true });
                }
            }
        } catch (err) {
            console.error('Error tracking order:', err);
            setError('Wystąpił błąd podczas wyszukiwania zamówienia');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIndex = (status: string) => {
        return ORDER_STATUSES.findIndex(s => s.key === status);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center tracking-tight">Śledź Zamówienie</h1>

                {/* Search Box */}
                <Card className="glass mb-8">
                    <CardContent className="pt-6">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSearch();
                            }}
                            className="flex gap-2"
                        >
                            <Input
                                placeholder="Wprowadź numer zamówienia (np. ORD-1234)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="font-mono text-sm"
                            />
                            <Button type="submit" disabled={loading || !searchQuery.trim()} aria-label="Szukaj zamówienia">
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Search className="w-4 h-4" />
                                )}
                            </Button>
                        </form>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            Numer zamówienia znajdziesz w wiadomości e-mail z potwierdzeniem zakupu
                        </p>
                    </CardContent>
                </Card>

                {/* Error State */}
                {error && hasSearched && (
                    <Card className="glass mb-8 border-destructive/50">
                        <CardContent className="pt-6 text-center">
                            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                            <p className="text-lg font-medium">{error}</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Upewnij się, że wpisany identyfikator jest dokładny.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Order Details */}
                {order && (
                    <>
                        {/* Status Timeline */}
                        <Card className="glass mb-6">
                            <CardHeader>
                                <CardTitle>Status przesyłki</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    {ORDER_STATUSES.map((status, index) => {
                                        const currentIndex = getStatusIndex(order.status);
                                        const isActive = index <= currentIndex;
                                        const isCurrent = index === currentIndex;
                                        const Icon = status.icon;

                                        return (
                                            <div key={status.key} className="flex items-start mb-6 last:mb-0">
                                                <div className="relative">
                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                                            isActive
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'bg-secondary text-muted-foreground'
                                                        } ${isCurrent ? 'ring-4 ring-primary/30' : ''}`}
                                                    >
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    {index < ORDER_STATUSES.length - 1 && (
                                                        <div
                                                            className={`absolute left-1/2 top-10 w-0.5 h-10 -translate-x-1/2 ${
                                                                index < currentIndex ? 'bg-primary' : 'bg-border'
                                                            }`}
                                                        />
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <p className={`font-medium ${isActive ? '' : 'text-muted-foreground'}`}>
                                                        {status.label}
                                                    </p>
                                                    {isCurrent && order.status === 'paid' && order.paid_at && (
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {formatDate(order.paid_at)}
                                                        </p>
                                                    )}
                                                    {isCurrent && order.status === 'pending' && (
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            Złożono: {formatDate(order.created_at)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Delivery Info */}
                        {order.inpost_point_name && (
                            <Card className="glass mb-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        Punkt odbioru Paczkomat InPost
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-semibold">{order.inpost_point_name}</p>
                                    <p className="text-sm text-muted-foreground mt-0.5">{order.inpost_point_address}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Order Summary */}
                        <Card className="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-primary" />
                                    Podsumowanie zamówienia
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Numer zamówienia</span>
                                    <code className="font-mono bg-secondary px-2 py-0.5 rounded text-xs">{order.order_id}</code>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Data złożenia</span>
                                    <span>{formatDate(order.created_at)}</span>
                                </div>

                                <div className="border-t border-border pt-4 space-y-3">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <span>
                                                {item.name} ({item.variantName}) x{item.quantity}
                                            </span>
                                            <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-border pt-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Produkty</span>
                                        <span>{formatPrice(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Dostawa</span>
                                        <span>{order.shipping_cost === 0 ? <strong className="text-green-500">GRATIS</strong> : formatPrice(order.shipping_cost)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                                        <span>Razem</span>
                                        <span className="text-primary">{formatPrice(order.total)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
};

export default OrderTracking;
