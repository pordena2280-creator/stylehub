import { useState, useEffect } from 'react';
import { profilesService, staffInviteService, orderService, type StaffInvite, type StaffRole } from '../../../services';
import { supabase } from '../../../services/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import type { User, Order } from '../../../types';
import '../Products/AdminProducts.css';
import './AdminUsers.css';

const AdminUsers = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<StaffInvite[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<StaffRole>('editor');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'todos' | 'cliente' | 'admin' | 'editor' | 'operador'>('todos');
  const [filterStatus] = useState<'todos' | 'activo' | 'bloqueado'>('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [userNotes, setUserNotes] = useState<Array<{ id: number; note: string; created_at: string }>>([]);
  const [newNote, setNewNote] = useState('');
  const [crmLoading, setCrmLoading] = useState(false);
  const [stats, setStats] = useState<{ total: number; admins: number; editors: number; operadores: number; clients: number; recent: number }>({ total: 0, admins: 0, editors: 0, operadores: 0, clients: 0, recent: 0 });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [allUsers, allStats, allInvites] = await Promise.all([
          profilesService.getAllProfiles(),
          profilesService.getStats(),
          isAdmin ? staffInviteService.listInvites() : Promise.resolve([]),
        ]);
        if (!cancelled) { setUsers(allUsers); setStats(allStats); setInvites(allInvites); }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar usuarios');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isAdmin]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      await staffInviteService.createInvite(inviteEmail, inviteRole);
      const list = await staffInviteService.listInvites();
      setInvites(list);
      setInviteEmail('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear invitación');
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole   = filterRole === 'todos' || u.role === filterRole;
    // Asumimos que todos los usuarios están activos por ahora (puedes agregar un campo status si lo necesitas)
    const matchStatus = filterStatus === 'todos' || true;
    return matchSearch && matchRole && matchStatus;
  });

  const openCRM = async (user: User) => {
    setSelectedUser(user);
    setUserOrders([]);
    setUserNotes([]);
    setNewNote('');
    setCrmLoading(true);
    try {
      const [orders, { data: notes }] = await Promise.all([
        orderService.getUserOrders(user.id),
        supabase.from('customer_notes').select('*').eq('customer_id', user.id).order('created_at', { ascending: false }),
      ]);
      setUserOrders(orders);
      setUserNotes((notes as Array<{ id: number; note: string; created_at: string }>) || []);
    } catch {
      // silencio — CRM es opcional
    } finally {
      setCrmLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedUser) return;
    const { data } = await supabase.from('customer_notes').insert({
      customer_id: selectedUser.id,
      note: newNote.trim(),
    }).select().single();
    if (data) setUserNotes(prev => [data as { id: number; note: string; created_at: string }, ...prev]);
    setNewNote('');
  };

  const totalSpent = userOrders
    .filter(o => o.payment_status === 'pagado')
    .reduce((s, o) => s + o.total, 0);

  const toggleRole = async (id: string, role: 'cliente' | 'admin' | 'editor' | 'operador') => {
    try {
      const updated = await profilesService.updateRole(id, role);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: updated.role } : u));
      if (selectedUser?.id === id) setSelectedUser(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al actualizar rol');
    }
  };

  const _getStatusClass = (status: string) => {
    if (status === 'activo')   return 'status-active';
    if (status === 'inactivo') return 'status-inactive';
    return 'status-out';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'cliente': 'Cliente',
      'admin': 'Administrador',
      'editor': 'Editor',
      'operador': 'Operador'
    };
    return labels[role] || role;
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, string> = {
      'cliente': 'fa-solid fa-user',
      'admin': 'fa-solid fa-user-shield',
      'editor': 'fa-solid fa-user-edit',
      'operador': 'fa-solid fa-user-tie'
    };
    return icons[role] || 'fa-solid fa-user';
  };

  const getRoleVariant = (role: string) => {
    const variants: Record<string, string> = {
      'cliente': 'role-client',
      'admin': 'role-admin',
      'editor': 'role-editor',
      'operador': 'role-operador'
    };
    return variants[role] || 'role-client';
  };

  return (
    <div className="admin-users">
      <div className="page-header">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>{loading ? '…' : `${users.length} usuarios registrados`}</p>
        </div>
        <div className="users-stats">
          <span className="stat-chip"><i className="fa-solid fa-circle-check"></i> {stats.clients} clientes</span>
          <span className="stat-chip admin"><i className="fa-solid fa-user-shield"></i> {stats.admins} admins</span>
          <span className="stat-chip editor"><i className="fa-solid fa-user-edit"></i> {stats.editors} editores</span>
          <span className="stat-chip operador"><i className="fa-solid fa-user-tie"></i> {stats.operadores} operadores</span>
        </div>
      </div>

      {error && <div className="admin-error">{error} <button onClick={() => setError(null)}>✕</button></div>}

      {isAdmin && (
        <div className="staff-invite-card">
          <h3><i className="fa-solid fa-user-plus" /> Invitar personal (email + rol)</h3>
          <p className="staff-invite-hint">
            Asigna el correo antes de que ingrese con contraseña o Google. Al registrarse, recibirá el rol automáticamente.
          </p>
          <form className="staff-invite-form" onSubmit={handleInvite}>
            <input
              type="email"
              placeholder="empleado@empresa.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              required
            />
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value as StaffRole)}>
              <option value="admin">Administrador</option>
              <option value="editor">Editor</option>
              <option value="operador">Operador</option>
            </select>
            <button type="submit" className="btn-primary">Invitar</button>
          </form>
          {invites.length > 0 && (
            <ul className="staff-invite-list">
              {invites.map(inv => (
                <li key={inv.id}>
                  <span>{inv.email}</span>
                  <span className="role-badge role-admin">{inv.role}</span>
                  <span>{inv.accepted_at ? 'Aceptada' : 'Pendiente'}</span>
                  {!inv.accepted_at && (
                    <button type="button" className="btn-icon delete" onClick={() => staffInviteService.deleteInvite(inv.id).then(() => staffInviteService.listInvites().then(setInvites))}>
                      <i className="fa-solid fa-trash" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="filters-bar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input type="text" placeholder="Buscar por nombre o email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
          <div className="filter-tabs">
          {[{ label: 'Todos', value: 'todos' as const }, { label: 'Cliente', value: 'cliente' as const }, { label: 'Admin', value: 'admin' as const }, { label: 'Editor', value: 'editor' as const }, { label: 'Operador', value: 'operador' as const }].map(item => (
            <button
              key={item.value}
              className={`filter-tab ${filterRole === (item.value as typeof filterRole) ? 'active' : ''}`}
              onClick={() => setFilterRole(item.value as typeof filterRole)}
            >
              {getRoleLabel(item.value)}
            </button>
          ))}
        </div>
      </div>

      <div className="table-card">
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Usuario</th><th>Rol</th><th>Teléfono</th><th>Registro</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="empty-row">Cargando usuarios…</td></tr>
              ) : filtered.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="customer-cell">
                      <div className="customer-avatar" style={{ background: user.role === 'admin' ? 'linear-gradient(135deg,#FCB500,#ff3d3d)' : user.role === 'editor' ? 'linear-gradient(135deg,#8B5CF6,#ff3d3d)' : user.role === 'operador' ? 'linear-gradient(135deg,#06B6D4,#ff3d3d)' : 'linear-gradient(135deg,#ff3d3d,#004ec3)' }}>
                        {(user.full_name || '?').charAt(0)}
                      </div>
                      <div>
                        <div className="customer-name">{user.full_name || 'Sin nombre'}</div>
                        <div className="customer-email">{user.email || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${getRoleVariant(user.role)}`}>
                      <i className={`${getRoleIcon(user.role)}`}></i> {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td>{user.phone || '—'}</td>
                  <td>{new Date(user.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <button className="btn-icon view" onClick={() => openCRM(user)} title="Ver perfil CRM">
                      <i className="fa-solid fa-user-pen"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="empty-row">No se encontraron usuarios</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-box modal-box-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fa-solid fa-address-card"></i> Perfil CRM — {selectedUser.full_name || selectedUser.email}</h2>
              <button className="modal-close" onClick={() => setSelectedUser(null)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">

              {/* Cabecera del usuario */}
              <div className="user-detail-header">
                <div className="user-detail-avatar" style={{ background: 'linear-gradient(135deg,#ff3d3d,#004ec3)' }}>
                  {(selectedUser.full_name || '?').charAt(0)}
                </div>
                <div>
                  <h3>{selectedUser.full_name || 'Sin nombre'}</h3>
                  <p>{selectedUser.email}</p>
                  <span className={`role-badge ${getRoleVariant(selectedUser.role)}`}>{getRoleLabel(selectedUser.role)}</span>
                  <span style={{ marginLeft: 8, fontSize: 12, color: '#888' }}>
                    Registrado: {new Date(selectedUser.created_at).toLocaleDateString('es-MX')}
                  </span>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#ff3d3d' }}>${totalSpent.toFixed(2)}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>Total gastado</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{userOrders.length} pedidos</div>
                </div>
              </div>

              {crmLoading ? (
                <p style={{ textAlign: 'center', padding: 24 }}>Cargando datos CRM…</p>
              ) : (
                <div className="modal-two-col" style={{ marginTop: 16 }}>

                  {/* Historial de pedidos */}
                  <div>
                    <h4 style={{ marginBottom: 8 }}><i className="fa-solid fa-bag-shopping"></i> Historial de Pedidos</h4>
                    {userOrders.length === 0 ? (
                      <p style={{ color: '#888', fontSize: 13 }}>Sin pedidos aún.</p>
                    ) : (
                      <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                        <table className="admin-table" style={{ fontSize: 13 }}>
                          <thead><tr><th>Orden</th><th>Total</th><th>Estado</th><th>Fecha</th></tr></thead>
                          <tbody>
                            {userOrders.map(o => (
                              <tr key={o.id}>
                                <td><code>{o.order_number}</code></td>
                                <td>${o.total.toFixed(2)}</td>
                                <td><span className={`status-pill ${o.status === 'entregado' ? 'status-active' : o.status === 'cancelado' ? 'status-inactive' : 'status-out'}`}>{o.status}</span></td>
                                <td>{new Date(o.created_at).toLocaleDateString('es-MX')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Cambio de rol */}
                    <h4 style={{ marginTop: 16, marginBottom: 8 }}><i className="fa-solid fa-user-tag"></i> Cambiar Rol</h4>
                    <div className="user-action-btns">
                      {(['cliente', 'admin', 'editor', 'operador'] as const)
                        .filter(r => r !== selectedUser.role)
                        .map(r => (
                          <button key={r} className="btn-action activate" onClick={() => toggleRole(selectedUser.id, r)}>
                            <i className={getRoleIcon(r)}></i> {getRoleLabel(r)}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Notas internas */}
                  <div>
                    <h4 style={{ marginBottom: 8 }}><i className="fa-solid fa-note-sticky"></i> Notas Internas</h4>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input
                        type="text"
                        placeholder="Añadir nota interna…"
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                        style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}
                      />
                      <button className="btn-primary" onClick={handleAddNote} style={{ padding: '6px 12px' }}>
                        <i className="fa-solid fa-plus"></i>
                      </button>
                    </div>
                    <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                      {userNotes.length === 0 ? (
                        <p style={{ color: '#888', fontSize: 13 }}>Sin notas.</p>
                      ) : userNotes.map(n => (
                        <div key={n.id} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '8px 12px', marginBottom: 6 }}>
                          <p style={{ margin: 0, fontSize: 13 }}>{n.note}</p>
                          <span style={{ fontSize: 11, color: '#888' }}>{new Date(n.created_at).toLocaleString('es-MX')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedUser(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
