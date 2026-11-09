import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, Clock, Copy, RefreshCw } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToastStore, useCartStore } from '@/lib/store';

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
    customer_email: string;
    customer_name: string;
    inpost_point_name: string | null;
    inpost_point_address: string | null;
    items: OrderItem[];
    subtotal: number;
    shipping_cost: number;
    total: number;
    status: string;
    created_at: string;
}

const OrderConfirmation: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { addToast } = useToastStore();
    const { clearCart } = useCartStore();

    const fetchOrder = async (isManualRefresh = false) => {
        if (!orderId) return;
        if (isManualRefresh) setIsRefreshing(true);

        try {
            const { data, error } = await supabase
                .from('orders')
                .select('id, order_id, customer_email, customer_name, inpost_point_name, inpost_point_address, items, subtotal, shipping_cost, total, status, created_at')
                .eq('order_id', orderId.trim().toUpperCase())
                .maybeSingle();

            if (error) {
                console.error('Error fetching order:', error);
            } else if (data) {
                const orderData = {
                    ...data,
                    items: (data.items || []) as unknown as OrderItem[],
                };
                setOrder(orderData as Order);

                // Bezpieczne wyczyszczenie koszyka po potwierdzeniu zamówienia
                clearCart();
            }
        } catch (err) {
            console.error('Fetch order error:', err);
        } finally {
            setLoading(false);
            if (isManualRefresh) setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    const copyOrderId = () => {
        if (orderId) {
            navigator.clipboard.writeText(orderId);
            addToast('Skopiowano numer zamówienia', 'success');
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
        }).format(price);
    };

    // Maskowanie adresu e-mail dla ochrony prywatności (np. j***@example.com)
    const maskEmail = (email: string) => {
        if (!email || !email.includes('@')) return email;
        const [user, domain] = email.split('@');
        if (user.length <= 2) return `${user[0]}***@${domain}`;
        return `${user.substring(0, 2)}***${user[user.length - 1]}@${domain}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center py-12">
                <Card className="glass max-w-md w-full mx-4">
                    <CardContent className="pt-6 text-center space-y-4">
                        <p className="text-lg font-medium">Nie znaleziono zamówienia</p>
                        <p className="text-xs text-muted-foreground">
                            Jeśli dopiero dokonałeś płatności, rejestracja zamówienia może potrwać kilka sekund.
                        </p>
                        <div className="flex gap-2 justify-center">
                            <Button variant="outline" onClick={() => fetchOrder(true)} disabled={isRefreshing}>
                                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Odśwież
                            </Button>
                            <Button asChild>
                                <Link to="/catalog">Wróć do sklepu</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4"
                    >
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </motion.div>
                    <h1 className="text-3xl font-bold mb-2 tracking-tight">Dziękujemy za zamówienie!</h1>
                    <p className="text-muted-foreground text-sm">
                        Potwierdzenie zostało wysłane na adres <strong className="text-foreground">{maskEmail(order.customer_email)}</strong>
                    </p>
                </div>

                {/* Order ID */}
                <Card className="glass mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-center text-base">Numer zamówienia</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center gap-2">
                            <code className="text-lg font-mono bg-secondary px-4 py-2 rounded-lg font-semibold tracking-wide">
                                {order.order_id}
                            </code>
                            <Button variant="ghost" size="icon" onClick={copyOrderId} aria-label="Kopiuj numer zamówienia">
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-center text-xs text-muted-foreground mt-2">
                            Zachowaj ten numer do śledzenia statusu paczki
                        </p>
                    </CardContent>
                </Card>

                {/* Order Status */}
                <Card className="glass mb-6">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Truck className="w-5 h-5 text-primary" />
                                Status zamówienia
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fetchOrder(true)}
                                disabled={isRefreshing}
                                className="h-8 text-xs text-muted-foreground"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Sprawdź
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                                order.status === 'paid' ? 'bg-green-500' :
                                    order.status === 'pending' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'
                            }`} />
                            <span className="font-semibold text-sm">
                                {order.status === 'paid' ? 'Opłacone — przekazane do realizacji' :
                                    order.status === 'pending' ? 'Oczekuje na potwierdzenie płatności (webhook)' :
                                        order.status}
                            </span>
                        </div>
                        {order.status === 'pending' && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Księgowanie płatności Stripe może zająć od kilku sekund do 2 minut.
                            </p>
                        )}
                        {order.inpost_point_name && (
                            <div className="mt-4 p-3 bg-secondary/50 rounded-xl border border-border">
                                <p className="font-medium text-sm">Paczkomat InPost: {order.inpost_point_name}</p>
                                <p className="text-xs text-muted-foreground">{order.inpost_point_address}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Order Items */}
                <Card className="glass mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Package className="w-5 h-5 text-primary" />
                            Zamówione produkty
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex gap-3 items-center">
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
                                    <p className="text-xs">{item.quantity} x {formatPrice(item.price)}</p>
                                </div>
                                <div className="text-right font-semibold text-sm">
                                    {formatPrice(item.price * item.quantity)}
                                </div>
                            </div>
                        ))}

                        <div className="border-t border-border pt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Wartość produktów</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Dostawa InPost</span>
                                <span>{order.shipping_cost === 0 ? <strong className="text-green-500">GRATIS</strong> : formatPrice(order.shipping_cost)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                                <span>Łącznie zapłacono</span>
                                <span className="text-primary">{formatPrice(order.total)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild variant="outline">
                        <Link to={`/order-tracking/${order.order_id}`}>
                            <Clock className="w-4 h-4 mr-2" />
                            Śledź zamówienie
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link to="/catalog">Kontynuuj zakupy</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
