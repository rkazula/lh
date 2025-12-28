import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCartStore, useToastStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { SEO } from '@/components/layout/SEO';
import { CartQuote, PickupPoint, PickupPointSchema, CheckoutResponse } from '@/types/api';
import { MapPin, Truck, RefreshCw } from 'lucide-react';
import { CheckoutStepper } from '@/components/features/CheckoutStepper';
import { SummaryPanel } from '@/components/features/SummaryPanel';
import { InPostPicker } from '@/components/features/shipping/InPostPicker';
import { DpdMapPicker } from '@/components/features/shipping/DpdMapPicker';

const checkoutSchema = z.object({
  email: z.string().email('Invalid email'),
  fullName: z.string().min(2, 'Name is required'),
  phone: z.string().min(9, 'Phone is required'),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    postalCode: z.string().min(1, 'Postal Code is required'),
    country: z.literal('PL'),
  }),
  shippingMethod: z.enum(['COURIER', 'INPOST_LOCKER', 'DPD_PICKUP']),
  discountCode: z.string().optional(),
  pickupPoint: PickupPointSchema.optional().nullable(),
}).refine(data => {
    if ((data.shippingMethod === 'INPOST_LOCKER' || data.shippingMethod === 'DPD_PICKUP') && !data.pickupPoint) {
        return false;
    }
    return true;
}, {
    message: "Please select a pickup point",
    path: ["pickupPoint"], // Attach error to pickupPoint field
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, clearCart } = useCartStore();
  const { addToast } = useToastStore();
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [activeStep, setActiveStep] = useState(1);

  // Modal States
  const [showInPost, setShowInPost] = useState(false);
  const [showDpd, setShowDpd] = useState(false);

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onBlur',
    defaultValues: {
      address: { country: 'PL' },
      shippingMethod: 'COURIER',
      pickupPoint: null,
    }
  });

  const watchedDiscount = watch('discountCode');
  const watchedShipping = watch('shippingMethod');
  const watchedPickupPoint = watch('pickupPoint');
  
  // Update step visual logic
  const watchedFields = watch();
  useEffect(() => {
    if (watchedFields.email && watchedFields.address?.street) {
        setActiveStep(2);
    } 
    if (watchedFields.email && watchedFields.address?.street && watchedFields.shippingMethod) {
        if (watchedFields.shippingMethod !== 'COURIER' && !watchedFields.pickupPoint) {
            // Stay on step 2 if point needed but not selected
        } else {
            // Ready for step 3 (Payment is implicit submit)
        }
    }
  }, [watchedFields]);

  // Quote Mutation
  const quoteMutation = useMutation({
    mutationFn: (data: { items: any[], discountCode?: string }) => api.quoteCart(data.items, data.discountCode),
    onSuccess: (data) => setQuote(data),
    onError: () => addToast('Failed to calculate totals', 'error'),
  });

  useEffect(() => {
    if (items.length === 0) return;
    const timeout = setTimeout(() => {
        quoteMutation.mutate({
            items: items.map(i => ({ variant_id: i.variantId, quantity: i.quantity })),
            discountCode: watchedDiscount
        });
    }, 500);
    return () => clearTimeout(timeout);
  }, [items, watchedDiscount]);

  // Create Order Mutation
  const orderMutation = useMutation({
    mutationFn: api.createOrder,
    onSuccess: (data: CheckoutResponse) => {
      clearCart();
      window.location.href = data.paymentUrl;
    },
    onError: (err: any) => addToast(err.message || 'Order failed', 'error'),
  });

  const onSubmit = (data: CheckoutFormValues) => {
    if (!quote) return;
    
    // Explicit validation check just in case
    if (data.shippingMethod !== 'COURIER' && !data.pickupPoint) {
        addToast('Please select a pickup point', 'error');
        return;
    }

    orderMutation.mutate({
      ...data,
      items: items.map(i => ({ variant_id: i.variantId, quantity: i.quantity })),
    });
  };

  const handleOpenMap = () => {
      if (watchedShipping === 'INPOST_LOCKER') setShowInPost(true);
      if (watchedShipping === 'DPD_PICKUP') setShowDpd(true);
  };

  const handlePointSelect = (point: PickupPoint) => {
      setValue('pickupPoint', point);
      trigger('pickupPoint'); // Clear errors
  };

  if (items.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Your cart is empty.</div>;
  }

  return (
    <>
      <SEO title="Checkout" />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN - FORM */}
          <div className="lg:col-span-7 space-y-8">
            <CheckoutStepper steps={['Details', 'Shipping', 'Payment']} currentStep={activeStep} />
            
            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Step 1: Contact & Address */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Contact & Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Email" {...register('email')} error={errors.email?.message} />
                    <Input placeholder="Phone" {...register('phone')} error={errors.phone?.message} />
                  </div>
                  <Input placeholder="Full Name" {...register('fullName')} error={errors.fullName?.message} />
                  <Input placeholder="Street" {...register('address.street')} error={errors.address?.street?.message} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="City" {...register('address.city')} error={errors.address?.city?.message} />
                    <Input placeholder="Postal Code" {...register('address.postalCode')} error={errors.address?.postalCode?.message} />
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Shipping Method */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Delivery Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: 'COURIER', label: 'Courier', price: '15.00 PLN', icon: Truck },
                            { id: 'INPOST_LOCKER', label: 'InPost', price: '12.00 PLN', icon: () => <div className="w-6 h-6 bg-[#FFCC00] rounded-sm text-[10px] flex items-center justify-center font-bold text-black">In</div> },
                            { id: 'DPD_PICKUP', label: 'DPD Point', price: '10.00 PLN', icon: MapPin },
                        ].map((method) => (
                            <label key={method.id} className="border rounded-xl p-4 cursor-pointer hover:border-primary transition-all duration-200 flex flex-col items-center gap-2 text-center has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:shadow-md">
                                <input 
                                    type="radio" 
                                    value={method.id} 
                                    {...register('shippingMethod')} 
                                    className="sr-only" 
                                    onChange={(e) => {
                                        setValue('shippingMethod', e.target.value as any);
                                        setValue('pickupPoint', null); // Reset point on method change
                                    }}
                                />
                                <method.icon className={cn("w-6 h-6", method.id === 'COURIER' && "text-primary")} />
                                <span className="font-medium text-sm">{method.label}</span>
                                <span className="text-xs text-muted-foreground">{method.price}</span>
                            </label>
                        ))}
                    </div>

                    {/* Pickup Point Selection Logic */}
                    {(watchedShipping === 'INPOST_LOCKER' || watchedShipping === 'DPD_PICKUP') && (
                        <div className="mt-4 animate-fade-in">
                            {watchedPickupPoint ? (
                                <div className="p-4 border border-primary/20 bg-primary/5 rounded-xl flex justify-between items-center">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center">
                                            {watchedPickupPoint.provider === 'INPOST' ? (
                                                <div className="text-[8px] font-bold">In</div>
                                            ) : (
                                                <MapPin className="w-5 h-5 text-primary" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{watchedPickupPoint.id}</p>
                                            <p className="text-xs text-muted-foreground">{watchedPickupPoint.address.line1}</p>
                                        </div>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={handleOpenMap}>
                                        Change
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-6 border border-dashed border-border rounded-xl text-center bg-secondary/10 flex flex-col items-center gap-2">
                                    <p className="text-sm font-medium">Select a pickup point</p>
                                    <Button type="button" variant="primary" onClick={handleOpenMap} className="gap-2">
                                        <MapPin className="w-4 h-4" /> 
                                        Open Map
                                    </Button>
                                    {errors.pickupPoint && (
                                        <p className="text-xs text-destructive animate-pulse">{errors.pickupPoint.message}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
              </Card>

            </form>
          </div>

          {/* RIGHT COLUMN - SUMMARY */}
          <div className="lg:col-span-5">
             <SummaryPanel 
                items={items}
                quote={quote}
                isLoading={quoteMutation.isPending}
                register={register}
                onSubmit={handleSubmit(onSubmit)}
                isSubmitting={orderMutation.isPending}
             />
          </div>

        </div>
      </div>

      {/* Modals */}
      <InPostPicker 
        open={showInPost} 
        onClose={() => setShowInPost(false)} 
        onSelect={handlePointSelect} 
      />
      <DpdMapPicker 
        open={showDpd} 
        onClose={() => setShowDpd(false)} 
        onSelect={handlePointSelect} 
      />
    </>
  );
}