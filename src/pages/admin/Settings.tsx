import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSessionToken } from '@/lib/supabase-client';
import { API_BASE_URL } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToastStore } from '@/lib/store';
import { useForm } from 'react-hook-form';

interface TaxSettings {
  global_vat_rate: number;
  prices_include_vat: boolean;
}

export default function Settings() {
  const { addToast } = useToastStore();
  const { register, handleSubmit, setValue } = useForm<TaxSettings>();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tax'],
    queryFn: async () => {
        const token = await getSessionToken();
        const res = await fetch(`${API_BASE_URL}/admin/tax`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.json();
    }
  });

  useEffect(() => {
    if (data) {
        setValue('global_vat_rate', data.global_vat_rate);
        setValue('prices_include_vat', data.prices_include_vat);
    }
  }, [data, setValue]);

  const mutation = useMutation({
    mutationFn: async (formData: TaxSettings) => {
        const token = await getSessionToken();
        const res = await fetch(`${API_BASE_URL}/admin/tax`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Update failed');
    },
    onSuccess: () => addToast('Settings updated', 'success'),
    onError: () => addToast('Failed to update settings', 'error')
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Settings</h1>
      
      <Card>
          <CardHeader>
              <CardTitle>Tax Configuration</CardTitle>
          </CardHeader>
          <CardContent>
              {isLoading ? <p>Loading...</p> : (
                  <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="text-sm font-medium mb-1.5 block">Global VAT Rate (Decimal)</label>
                              <Input type="number" step="0.01" {...register('global_vat_rate', { valueAsNumber: true })} />
                              <p className="text-xs text-muted-foreground mt-1">e.g. 0.23 for 23%</p>
                          </div>
                          <div className="flex items-center space-x-2 pt-8">
                             <input type="checkbox" {...register('prices_include_vat')} className="h-4 w-4 rounded border-gray-300" />
                             <label className="text-sm font-medium">Prices include VAT</label>
                          </div>
                      </div>
                      <Button type="submit" isLoading={mutation.isPending}>Save Changes</Button>
                  </form>
              )}
          </CardContent>
      </Card>
    </div>
  );
}