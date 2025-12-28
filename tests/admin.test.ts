import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAdmin } from '../netlify/lib/admin-auth';
import * as supabaseLib from '../netlify/lib/supabase';

describe('Admin Auth Guard', () => {
    it('throws if no header', async () => {
        await expect(requireAdmin({})).rejects.toThrow('Missing Authorization header');
    });

    it('throws if invalid token', async () => {
        // Mock getUser error
        const mockSupabase = {
            auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: 'err' }) }
        };
        (supabaseLib.getSupabaseAdmin as any).mockReturnValue(mockSupabase);

        await expect(requireAdmin({ Authorization: 'Bearer fake' })).rejects.toThrow('Invalid Token');
    });

    it('throws if no admin role', async () => {
        // Mock user success, role fail
        const mockSupabase = {
            auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null }) },
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: null, error: 'Not found' })
                        })
                    })
                })
            })
        };
        (supabaseLib.getSupabaseAdmin as any).mockReturnValue(mockSupabase);

        await expect(requireAdmin({ Authorization: 'Bearer valid' })).rejects.toThrow('Forbidden');
    });

    it('returns user if admin', async () => {
        const mockUser = { id: 'admin-123', email: 'admin@local.haters' };
        const mockSupabase = {
            auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) },
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { role: 'ADMIN' }, error: null })
                        })
                    })
                })
            })
        };
        (supabaseLib.getSupabaseAdmin as any).mockReturnValue(mockSupabase);

        const result = await requireAdmin({ Authorization: 'Bearer valid' });
        expect(result).toEqual(mockUser);
    });
});