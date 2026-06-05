import { useState, useEffect } from 'react';
import { couponService } from '../../../services';
import type { Coupon } from '../../../types';
import '../Products/AdminProducts.css';
import './AdminCoupons.css';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'percentage' | 'fixed'>('todos');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [couponForm, setCouponForm] = useState<Partial<Coupon>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await couponService.getAllCoupons();
        if (!cancelled) setCoupons(data);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar cupones');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = coupons.filter(c => {
    const matchSearch = c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'todos' || c.type === filterType;
    const matchStatus = filterStatus === 'todos' || 
      (filterStatus === 'activo' && c.is_active) || 
      (filterStatus === 'inactivo' && !c.is_active);
    return matchSearch && matchType && matchStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await couponService.createCoupon(couponForm as any);
      setCouponForm({});
      // Refetch coupons
      const data = await couponService.getAllCoupons();
      setCoupons(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al crear cupón');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoupon) return;
    try {
      await couponService.updateCoupon(selectedCoupon.id, couponForm as any);
      setSelectedCoupon(null);
      setCouponForm({});
      // Refetch coupons
      const data = await couponService.getAllCoupons();
      setCoupons(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al actualizar cupón');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este cupón?')) return;
    try {
      await couponService.deleteCoupon(id);
      // Refetch coupons
      const data = await couponService.getAllCoupons();
      setCoupons(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar cupón');
    }
  };

  const selectCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      discount: coupon.discount,
      type: coupon.type,
      description: coupon.description,
      starts_at: coupon.starts_at,
      ends_at: coupon.ends_at,
      usage_limit: coupon.usage_limit,
      usage_limit_per_user: coupon.usage_limit_per_user,
      min_purchase_amount: coupon.min_purchase_amount,
      applicable_to: coupon.applicable_to,
      product_ids: coupon.product_ids,
      category_ids: coupon.category_ids,
      is_active: coupon.is_active
    });
  };

  const clearSelection = () => {
    setSelectedCoupon(null);
    setCouponForm({});
  };

  return (
    <div className="admin-coupons">
      <div className="page-header">
        <div>
          <h1>Gestión de Cupones</h1>
          <p>Crea y administra códigos de descuento para tu tienda</p>
        </div>
        <div className="header-actions">
          {selectedCoupon ? (
            <button className="btn-outline" onClick={clearSelection}>
              <i className="fa-solid fa-times"></i> Cancelar
            </button>
          ) : (
            <button className="btn-primary" onClick={() => {
              setSelectedCoupon(null);
              setCouponForm({});
            }}>
              <i className="fa-solid fa-plus"></i> Nuevo Cupón
            </button>
          )}
        </div>
      </div>

      {error && <div className="admin-error">{error} <button onClick={() => setError(null)}>✕</button></div>}

      <div className="filters-bar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input type="text" placeholder="Buscar por código o descripción…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
<div className="filter-group">
           <div className="filter-label">Tipo:</div>
           <div className="filter-tabs">
             {['todos', 'percentage', 'fixed'].map(t => (
               <button 
                 key={t} 
                 className={`filter-tab ${filterType === t ? 'active' : ''}`} 
                 onClick={() => setFilterType(t as typeof filterType)}
               >
                 {t === 'todos' ? 'Todos' : t === 'percentage' ? 'Porcentaje' : 'Fijo'}
               </button>
             ))}
           </div>
         </div>
<div className="filter-group">
           <div className="filter-label">Estado:</div>
           <div className="filter-tabs">
             {['todos', 'activo', 'inactivo'].map(s => (
               <button 
                 key={s} 
                 className={`filter-tab ${filterStatus === s ? 'active' : ''}`} 
                 onClick={() => setFilterStatus(s as typeof filterStatus)}
               >
                 {s === 'todos' ? 'Todos' : s === 'activo' ? 'Activo' : 'Inactivo'}
               </button>
             ))}
           </div>
         </div>
      </div>

      {/* Cupón Form */}
      {selectedCoupon && (
        <div className="coupon-form-card">
          <div className="form-header">
            <h3>{selectedCoupon.id ? 'Editar Cupón' : 'Nuevo Cupón'}</h3>
          </div>
          <form onSubmit={selectedCoupon ? handleUpdate : handleCreate} className="coupon-form">
            <div className="form-row">
              <div className="form-group">
                <label>Código *</label>
                <input
                  type="text"
                  value={couponForm.code || ''}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="DESCUENTO10"
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <input
                  type="text"
                  value={couponForm.description || ''}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="10% de descuento en tu primera compra"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tipo de Descuento *</label>
                <select
                  value={couponForm.type || 'percentage'}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, type: e.target.value as any }))}
                  required
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto Fijo ($)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Valor *</label>
                <input
                  type="number"
                  value={couponForm.discount || 0}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, discount: Number(e.target.value) || 0 }))}
                  min="0"
                  step="0.01"
                  required
                />
                <span className="form-unit">{couponForm.type === 'percentage' ? '%' : '$'}</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fecha de Inicio</label>
                <input
                  type="datetime-local"
                  value={couponForm.starts_at || ''}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, starts_at: e.target.value || undefined }))}
                />
              </div>
              <div className="form-group">
                <label>Fecha de Fin</label>
                <input
                  type="datetime-local"
                  value={couponForm.ends_at || ''}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, ends_at: e.target.value || undefined }))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Límite de Usos</label>
                <input
                  type="number"
                  value={couponForm.usage_limit || 0}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, usage_limit: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  min="0"
                />
                <span className="form-help">0 = ilimitado</span>
              </div>
              <div className="form-group">
                <label>Límite por Usuario</label>
                <input
                  type="number"
                  value={couponForm.usage_limit_per_user || 0}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, usage_limit_per_user: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  min="0"
                />
                <span className="form-help">0 = ilimitado</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Monto Mínimo de Compra</label>
                <input
                  type="number"
                  value={couponForm.min_purchase_amount || 0}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, min_purchase_amount: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  min="0"
                  step="0.01"
                />
                <span className="form-help">0 = sin mínimo</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Aplicable a:</label>
                <select
                  value={couponForm.applicable_to || 'all'}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, applicable_to: e.target.value as any }))}
                >
                  <option value="all">Todos los productos</option>
                  <option value="specific_products">Productos específicos</option>
                  <option value="specific_categories">Categorías específicas</option>
                </select>
              </div>
            </div>

            {couponForm.applicable_to === 'specific_products' && (
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Productos Especiales (IDs separados por coma)</label>
                  <input
                    type="text"
                    value={couponForm.product_ids ? couponForm.product_ids.join(',') : ''}
                    onChange={(e) => {
                      const ids = e.target.value
                        .split(',')
                        .map(id => id.trim())
                        .filter(id => id !== '')
                        .map(id => parseInt(id))
                        .filter(id => !isNaN(id));
                      setCouponForm(prev => ({ ...prev, product_ids: ids.length > 0 ? ids : undefined }));
                    }}
                    placeholder="1, 5, 12, 25"
                  />
                  <span className="form-help">Ej: 1, 5, 12</span>
                </div>
              </div>
            )}

            {couponForm.applicable_to === 'specific_categories' && (
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Categorías Específicas (IDs separados por coma)</label>
                  <input
                    type="text"
                    value={couponForm.category_ids ? couponForm.category_ids.join(',') : ''}
                    onChange={(e) => {
                      const ids = e.target.value
                        .split(',')
                        .map(id => id.trim())
                        .filter(id => id !== '')
                        .map(id => parseInt(id))
                        .filter(id => !isNaN(id));
                      setCouponForm(prev => ({ ...prev, category_ids: ids.length > 0 ? ids : undefined }));
                    }}
                    placeholder="1, 3, 7"
                  />
                  <span className="form-help">Ej: 1, 3, 7</span>
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group full-width">
                <label>
                  <input
                    type="checkbox"
                    checked={couponForm.is_active ?? true}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                  Cupón activo
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-outline" onClick={clearSelection}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {selectedCoupon ? 'Actualizar' : 'Crear'} Cupón
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Usos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="empty-row">Cargando cupones…</td></tr>
              ) : filtered.map(coupon => (
                <tr key={coupon.id}>
                  <td><code className="coupon-code">{coupon.code}</code></td>
                  <td>{coupon.description || '—'}</td>
                  <td>
                    <span className={`coupon-type ${coupon.type}`}>
                      {coupon.type === 'percentage' ? 'Porcentaje' : 'Fijo'}
                    </span>
                  </td>
                  <td>
                    {coupon.type === 'percentage' ? `${coupon.discount}%` : `$${coupon.discount.toFixed(2)}`}
                  </td>
                  <td>{coupon.times_used}</td>
                  <td>
                    <span className={`status-badge ${coupon.is_active ? 'active' : 'inactive'}`}>
                      {coupon.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon edit" onClick={() => selectCoupon(coupon)} title="Editar">
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button className="btn-icon delete" onClick={() => handleDelete(coupon.id)} title="Eliminar">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="empty-row">No se encontraron cupones</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;