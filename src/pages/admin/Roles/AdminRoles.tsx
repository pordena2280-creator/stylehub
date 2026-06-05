import { useState, useEffect } from 'react';
import { roleService } from '../../../services';
import { profilesService } from '../../../services/profilesService';
import type { User } from '../../../types';
import './AdminRoles.css';

const AdminRoles = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});

  const availableRoles: Array<'cliente' | 'admin' | 'editor' | 'operador'> = ['cliente', 'admin', 'editor', 'operador'];

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [usersData] = await Promise.all([
          profilesService.getAllProfiles()
        ]);

        const permissions = {
          admin: roleService.getPermissionsByRole('admin'),
          editor: roleService.getPermissionsByRole('editor'),
          operador: roleService.getPermissionsByRole('operador'),
          cliente: roleService.getPermissionsByRole('cliente')
        };

        if (!cancelled) {
          setUsers(usersData);
          setRolePermissions(permissions);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar datos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'cliente' | 'admin' | 'editor' | 'operador') => {
    setUpdatingUserId(userId);
    try {
      await roleService.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al actualizar rol');
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="admin-roles">
      <div className="page-header">
        <div>
          <h1>Gestión de Roles y Permisos</h1>
          <p>Administra los roles de usuario y sus permisos en el sistema</p>
        </div>
      </div>

      {error && <div className="admin-error">{error} <button onClick={() => setError(null)}>✕</button></div>}

      {/* Users Table */}
      <div className="users-section">
        <h2>Usuarios ({users.length})</h2>
        {loading ? (
          <div className="loading">Cargando usuarios...</div>
        ) : users.length > 0 ? (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Fecha registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.full_name || '—'}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                        disabled={updatingUserId === user.id}
                        className={`role-select role-${user.role}`}
                      >
                        {availableRoles.map(r => (
                          <option key={r} value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</td>
                    <td>
                      <span className={`status-badge ${user.role === 'admin' ? 'active' : 'inactive'}`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">
            <p>No se encontraron usuarios.</p>
          </div>
        )}
      </div>

      {/* Roles Overview */}
      <div className="roles-overview">
        <h2>Roles y Permisos</h2>
        <div className="roles-grid">
          {availableRoles.map(role => (
            <div key={role} className="role-card">
              <div className="role-header">
                <h3>
                  {role === 'admin' && <i className="fa-solid fa-user-shield"></i>}
                  {role === 'editor' && <i className="fa-solid fa-user-edit"></i>}
                  {role === 'operador' && <i className="fa-solid fa-user-tie"></i>}
                  {role === 'cliente' && <i className="fa-solid fa-user"></i>}
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </h3>
                <span className="role-description">
                  {role === 'admin' && 'Acceso completo al sistema'}
                  {role === 'editor' && 'Gestión de contenido y productos'}
                  {role === 'operador' && 'Gestión de órdenes y operaciones'}
                  {role === 'cliente' && 'Usuario estándar de la tienda'}
                </span>
              </div>
              <div className="role-permissions">
                <h4>Permisos ({rolePermissions[role]?.length || 0}):</h4>
                <ul className="permissions-list">
                  {rolePermissions[role]?.map((perm, index) => (
                    <li key={index} className="permission-item">
                      <i className="fa-solid fa-check"></i>
                      <span>{perm}</span>
                    </li>
                  ))}
                  {rolePermissions[role]?.length === 0 && (
                    <li className="permission-item empty">No tiene permisos asignados</li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminRoles;