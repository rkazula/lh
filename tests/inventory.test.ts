import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reserveStock } from '../netlify/lib/domain/inventory';
import * as supabaseLib from '../netlify/lib/supabase';

describe('Inventory Domain', () => {
    let mockUpdate: any;
    let mockSelect: any;

    beforeEach(() => {
        mockUpdate = vi.fn();
        mockSelect = vi.fn();

        const mockSupabase = {
            from: vi.fn().mockReturnValue({
                update: mockUpdate,
                select: mockSelect,
                insert: vi.fn().mockResolvedValue({ error: null })
            }),
            rpc: vi.fn().mockReturnValue(1)
        };
        (supabaseLib.getSupabaseAdmin as any).mockReturnValue(mockSupabase);
    });

    it('reserves stock when available', async () => {
        // Mock successful fetch: 10 on hand, 0 reserved
        mockSelect.mockReturnValue({
            eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { on_hand: 10, reserved: 0 }, error: null })
            })
        });

        // Mock successful update
        mockUpdate.mockReturnValue({
            eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null })
            })
        });

        await expect(reserveStock([{ variant_id: 'v1', quantity: 2 }], 'ord-1')).resolves.not.toThrow();
    });

    it('throws when stock insufficient', async () => {
        // Mock fetch: 1 on hand, 0 reserved. Requesting 2.
        mockSelect.mockReturnValue({
            eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { on_hand: 1, reserved: 0 }, error: null })
            })
        });

        await expect(reserveStock([{ variant_id: 'v1', quantity: 2 }], 'ord-1')).rejects.toThrow('Stock insufficient');
    });

    it('throws on concurrency error (optimistic lock fail)', async () => {
        // Fetch success
        mockSelect.mockReturnValue({
            eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { on_hand: 10, reserved: 0 }, error: null })
            })
        });

        // Update fails (simulating DB row changed between read/write)
        mockUpdate.mockReturnValue({
            eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: { message: 'No rows updated' } })
            })
        });

        await expect(reserveStock([{ variant_id: 'v1', quantity: 1 }], 'ord-1')).rejects.toThrow('Concurrency error');
    });
});