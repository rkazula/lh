import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSessionToken } from '@/lib/supabase-client';
import { API_BASE_URL } from '@/lib/constants';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToastStore } from '@/lib/store';
import { Plus, Minus, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Fetcher
const fetchInventory = async () => {
  const token = await getSessionToken();
  const res = await fetch(`${API_BASE_URL}/admin/inventory`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
};

export default function Inventory() {
  const { addToast } = useToastStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [adjustItem, setAdjustItem] = useState<any>(null); // Item to adjust
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('Manual Correction');

  const { data: inventory, isLoading, error } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: fetchInventory
  });

  const adjustMutation = useMutation({
    mutationFn: async (payload: { variantId: string, delta: number, reason: string }) => {
        const token = await getSessionToken();
        const res = await fetch(`${API_BASE_URL}/admin/inventory/adjust`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to adjust');
        }
        return res.json();
    },
    onSuccess: () => {
        addToast('Stock adjusted successfully', 'success');
        setAdjustItem(null);
        setAdjustAmount(0);
        queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
    },
    onError: (err: any) => addToast(err.message, 'error')
  });

  const filteredData = inventory?.filter((item: any) => 
      item.product_name.toLowerCase().includes(search.toLowerCase()) || 
      item.sku.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const columns = [
      { header: 'Product', accessorKey: 'product_name' as const, className: 'font-medium' },
      { header: 'SKU', accessorKey: 'sku' as const, className: 'font-mono text-xs' },
      { 
          header: 'Attributes', 
          cell: (row: any) => <span className="text-xs text-muted-foreground">{row.size} / {row.color}</span> 
      },
      { 
          header: 'On Hand', 
          accessorKey: 'on_hand' as const,
          cell: (row: any) => (
             <span className={row.on_hand <= (row.low_stock_threshold || 5) ? 'text-orange-500 font-bold' : ''}>
                 {row.on_hand}
             </span>
          )
      },
      { header: 'Reserved', accessorKey: 'reserved' as const },
      { 
          header: 'Available', 
          cell: (row: any) => {
              const avail = row.on_hand - row.reserved;
              return (
                  <Badge variant={avail > 0 ? 'secondary' : 'destructive'}>
                      {avail}
                  </Badge>
              );
          }
      },
      {
          header: 'Status',
          cell: (row: any) => (
            <Badge variant={row.active ? 'success' : 'outline'}>{row.active ? 'Active' : 'Hidden'}</Badge>
          )
      },
      {
          header: 'Actions',
          className: 'text-right',
          cell: (row: any) => (
              <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => { setAdjustItem(row); setAdjustAmount(1); }}>
                      <Plus className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => { setAdjustItem(row); setAdjustAmount(-1); }}>
                      <Minus className="w-3 h-3" />
                  </Button>
              </div>
          )
      }
  ];

  if (error) return <div className="p-8 text-destructive">Error loading inventory. You might not be authorized.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground">Manage stock levels and product visibility.</p>
        </div>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-inventory'] })} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input 
             className="border-0 bg-transparent focus-visible:ring-0 px-0 h-auto"
             placeholder="Search products or SKU..."
             value={search}
             onChange={e => setSearch(e.target.value)}
          />
      </div>

      <DataTable 
         data={filteredData} 
         columns={columns} 
         isLoading={isLoading} 
      />

      <Modal open={!!adjustItem} onClose={() => setAdjustItem(null)} title="Adjust Stock">
        {adjustItem && (
            <div className="p-6 space-y-6">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Product</p>
                    <p className="text-lg font-bold">{adjustItem.product_name} <span className="text-muted-foreground font-normal">({adjustItem.sku})</span></p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium mb-2">Adjustment Amount</p>
                        <Input 
                            type="number" 
                            value={adjustAmount} 
                            onChange={e => setAdjustAmount(parseInt(e.target.value))} 
                        />
                        <p className="text-xs text-muted-foreground mt-1">Use negative values to remove stock.</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium mb-2">Reason</p>
                        <Input 
                            value={adjustReason} 
                            onChange={e => setAdjustReason(e.target.value)} 
                        />
                    </div>
                </div>

                <div className="bg-secondary/20 p-4 rounded-lg flex gap-3 items-start">
                    <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                        This action will strictly update the "On Hand" count. Reserved stock is not affected directly. 
                        A record will be created in Stock Movements.
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="ghost" onClick={() => setAdjustItem(null)}>Cancel</Button>
                    <Button 
                        onClick={() => adjustMutation.mutate({ 
                            variantId: adjustItem.variant_id, 
                            delta: adjustAmount, 
                            reason: adjustReason 
                        })}
                        isLoading={adjustMutation.isPending}
                    >
                        Confirm Adjustment
                    </Button>
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
}