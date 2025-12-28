import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { CheckCircle } from 'lucide-react';
import { SEO } from '@/components/layout/SEO';
import { motion } from 'framer-motion';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');

  return (
    <>
      <SEO title="Order Confirmed" />
      <div className="container mx-auto px-4 min-h-[80vh] flex flex-col items-center justify-center text-center space-y-6">
        <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-4 border border-green-500/20 shadow-xl shadow-green-500/10"
        >
          <CheckCircle className="w-12 h-12" />
        </motion.div>
        
        <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Order Confirmed</h1>
            <p className="text-muted-foreground max-w-md mx-auto text-lg">
              Thank you for your purchase. Your silence is securely packed and will be shipped shortly.
            </p>
            {orderId && (
                <p className="text-xs font-mono text-muted-foreground pt-4">
                    Order ID: {orderId}
                </p>
            )}
        </div>

        <div className="pt-8">
            <Link to="/">
                <Button variant="outline" className="rounded-full px-8">Back to the Void</Button>
            </Link>
        </div>
      </div>
    </>
  );
}