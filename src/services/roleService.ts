import { supabase } from './supabase';
import type { User } from '../types';

export const roleService = {
  // Obtener todos los roles disponibles
  getAvailableRoles(): Array<'cliente' | 'admin' | 'editor' | 'operador'> {
    return ['cliente', 'admin', 'editor', 'operador'];
  },

  // Verificar si un usuario tiene un rol específico
  hasRole(user: User | null, role: 'cliente' | 'admin' | 'editor' | 'operador'): boolean {
    return user?.role === role;
  },

  // Verificar si un usuario tiene alguno de los roles especificados
  hasAnyRole(user: User | null, roles: ('cliente' | 'admin' | 'editor' | 'operador')[]): boolean {
    return user && roles.includes(user.role as any);
  },

  // Actualizar el rol de un usuario
  async updateUserRole(userId: string, role: 'cliente' | 'admin' | 'editor' | 'operador'): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  },

  // Obtener permisos basados en el rol
  getPermissionsByRole(role: 'cliente' | 'admin' | 'editor' | 'operador'): string[] {
    const permissionsMap: Record<'cliente' | 'admin' | 'editor' | 'operador', string[]> = {
      'cliente': [
        'view_products',
        'view_categories',
        'manage_cart',
        'manage_wishlist',
        'create_order',
        'view_own_orders',
        'manage_profile'
      ],
      'operador': [
        'view_products',
        'manage_products',
        'view_orders',
        'manage_orders',
        'view_customers',
        'view_reports'
      ],
      'editor': [
        'view_products',
        'manage_products',
        'manage_categories',
        'manage_blog',
        'manage_banners',
        'view_orders'
      ],
      'admin': [
        'view_products',
        'manage_products',
        'manage_categories',
        'manage_orders',
        'manage_users',
        'manage_roles',
        'manage_blog',
        'manage_banners',
        'manage_settings',
        'view_reports',
        'manage_payments',
        'manage_coupons'
      ]
    };
    
    return permissionsMap[role] || [];
  },

  // Verificar si un usuario tiene un permiso específico
  hasPermission(user: User | null, permission: string): boolean {
    if (!user) return false;
    const permissions = this.getPermissionsByRole(user.role as any);
    return permissions.includes(permission);
  }
};