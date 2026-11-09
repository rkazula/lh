import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, Clock, Copy } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { ANIMATION_VARIANTS } from '@/lib/constants';
import { useToastStore } from '@/lib/store';

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
    const { addToast } = useToastStore();

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;

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
                    items: data.items as unknown as OrderItem[],
                };
                setOrder(orderData as Order);
            }
            setLoading(false);
        };

        fetchOrder();
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="glass max-w-md w-full mx-4">
                    <CardContent className="pt-6 text-center">
                        <p className="text-lg mb-4">Nie znaleziono zamówienia</p>
                        <Button asChild>
                            <Link to="/catalog">Wróć do sklepu</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <motion.div
            initial={ANIMATION_VARIANTS.pageInitial}
            animate={ANIMATION_VARIANTS.pageAnimate}
            exit={ANIMATION_VARIANTS.pageExit}
            transition={{ duration: 0.4 }}
            className="min-h-screen py-12"
        >
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
                    <h1 className="text-3xl font-bold mb-2">Dziękujemy za zamówienie!</h1>
                    <p className="text-muted-foreground">
                        Potwierdzenie zostało wysłane na {order.customer_email}
                    </p>
                </div>

                {/* Order ID */}
                <Card className="glass mb-6">
                    <CardHeader>
                        <CardTitle className="text-center text-lg">Numer zamówienia</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center gap-2">
                            <code className="text-lg font-mono bg-secondary px-4 py-2 rounded">
                                {order.order_id}
                            </code>
                            <Button variant="ghost" size="icon" onClick={copyOrderId}>
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-center text-sm text-muted-foreground mt-2">
                            Zachowaj ten numer do śledzenia zamówienia
                        </p>
                    </CardContent>
                </Card>

                {/* Order Status */}
                <Card className="glass mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="w-5 h-5" />
                            Status zamówienia
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${
                                order.status === 'paid' ? 'bg-green-500' :
                                    order.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                            }`} />
                            <span className="font-medium">
                {order.status === 'paid' ? 'Opłacone' :
                    order.status === 'pending' ? 'Oczekuje na płatność' :
                        order.status}
              </span>
                        </div>
                        {order.inpost_point_name && (
                            <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                                <p className="font-medium">Paczkomat InPost: {order.inpost_point_name}</p>
                                <p className="text-sm text-muted-foreground">{order.inpost_point_address}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Order Items */}
                <Card className="glass mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Zamówione produkty
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex gap-3">
                                {item.image && (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                )}
                                <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.variantName}</p>
                                    <p className="text-sm">{item.quantity} x {formatPrice(item.price)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                            </div>
                        ))}

                        <div className="border-t border-border pt-4 space-y-2">
                            <div className="flex justify-between">
                                <span>Produkty</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Dostawa</span>
                                <span>{formatPrice(order.shipping_cost)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                                <span>Razem</span>
                                <span>{formatPrice(order.total)}</span>
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
        </motion.div>
    );
};

export default OrderConfirmation;