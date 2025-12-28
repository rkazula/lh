import { useToastStore } from '@/lib/store';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none p-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
              "pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-lg backdrop-blur-md border border-white/10 dark:border-white/5",
              toast.type === 'success' && "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
              toast.type === 'error' && "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
              toast.type === 'info' && "bg-background/80 text-foreground"
            )}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 shrink-0" />}
            
            <p className="text-sm font-medium flex-grow">{toast.message}</p>
            
            <button 
              onClick={() => removeToast(toast.id)} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}