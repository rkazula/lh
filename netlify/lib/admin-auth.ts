import { getSupabaseAdmin } from './supabase';

/**
 * Verifies that the request comes from an authenticated user with the 'ADMIN' role.
 * Returns the user object if successful, throws an error otherwise.
 */
export async function requireAdmin(headers: Record<string, string | undefined>) {
  const authHeader = headers['authorization'] || headers['Authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing Authorization header');
  }

  const token = authHeader.split(' ')[1];
  const supabase = getSupabaseAdmin();

  // 1. Verify Token
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid Token');
  }

  // 2. Verify Role
  // Assumes table `user_roles` exists: (user_id: uuid, role: string)
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'ADMIN')
    .single();

  if (roleError || !roleData) {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
}