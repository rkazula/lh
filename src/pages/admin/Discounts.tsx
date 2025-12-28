import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSessionToken } from '@/lib/supabase-client';
import { API_BASE_URL } from '@/lib/constants';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToastStore } from '@/lib/store';
import { Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const discountSchema = z.object({
  code: z.string().min(3).regex(/^[A-Z0-9]+$/, "Uppercase alphanumeric only"),
  type: z.enum(['PERCENT', 'FIXED']),
  value: z.number().min(1),
  min_order_amount: z.number().min(0).default(0),
  active: z.boolean().default(true)
});

type DiscountForm = z.infer<typeof discountSchema>;

const fetchDiscounts = async () => {
  const token = await getSessionToken();
  const res = await fetch(`${API_BASE_URL}/admin/discounts`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
};

export default function Discounts() {
  const [isModalOpen, setModalOpen] = useState(false);
  const { addToast } = useToastStore();
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DiscountForm>({
      resolver: zodResolver(discountSchema),
      defaultValues: { type: 'PERCENT', active: true }
  });

  const { data: discounts, isLoading } = useQuery({
    queryKey: ['admin-discounts'],
    queryFn: fetchDiscounts
  });

  const createMutation = useMutation({
    mutationFn: async (data: DiscountForm) => {
        const token = await getSessionToken();
        const res = await fetch(`${API_BASE_URL}/admin/discounts`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create');
    },
    onSuccess: () => {
        addToast('Discount created', 'success');
        setModalOpen(false);
        reset();
        queryClient.invalidateQueries({ queryKey: ['admin-discounts'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        const token = await getSessionToken();
        await fetch(`${API_BASE_URL}/admin/discounts?id=${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
    },
    onSuccess: () => {
        addToast('Discount deleted', 'success');
        queryClient.invalidateQueries({ queryKey: ['admin-discounts'] });
    }
  });

  const columns = [
      { header: 'Code', accessorKey: 'code' as const, className: 'font-mono font-bold' },
      { header: 'Type', accessorKey: 'type' as const },
      { header: 'Value', cell: (row: any) => row.type === 'PERCENT' ? `${row.value}%` : row.value / 100 },
      { header: 'Min Order', cell: (row: any) => row.min_order_amount / 100 },
      { 
          header: 'Actions', 
          cell: (row: any) => (
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(row.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
              </Button>
          ) 
      }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Discounts</h1>
        <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Code
        </Button>
      </div>

      <DataTable data={discounts || []} columns={columns} isLoading={isLoading} />

      <Modal open={isModalOpen} onClose={() => setModalOpen(false)} title="Create Discount">
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="p-6 space-y-4">
              <Input placeholder="Code (e.g. SUMMER20)" {...register('code')} error={errors.code?.message} className="uppercase" />
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs mb-1 block">Type</label>
                    <select {...register('type')} className="w-full h-11 rounded-lg border border-input bg-transparent px-3 text-sm">
                        <option value="PERCENT">Percentage (%)</option>
                        <option value="FIXED">Fixed Amount (PLN)</option>
                    </select>
                 </div>
                 <Input type="number" placeholder="Value" {...register('value', { valueAsNumber: true })} error={errors.value?.message} />
              </div>
              <Input type="number" placeholder="Min Order Amount (Grosze)" {...register('min_order_amount', { valueAsNumber: true })} />
              
              <div className="flex justify-end pt-4">
                  <Button type="submit" isLoading={createMutation.isPending}>Create</Button>
              </div>
          </form>
      </Modal>
    </div>
  );
}