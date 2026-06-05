import { useState, useEffect } from 'react';
import { settingsService } from '../../../services';
import type { StoreSettings, PaymentMethodSettings, ShippingZone, TaxRule } from '../../../services/settingsService';
import '../Products/AdminProducts.css';
import './AdminSettings.css';

const AdminSettings = () => {
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodSettings[]>([]);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'store' | 'payment' | 'shipping' | 'tax'>('store');

  // Form states
  const [storeForm, setStoreForm] = useState<Partial<StoreSettings>>({});
  const [paymentForm, setPaymentForm] = useState<Partial<PaymentMethodSettings>>({});
  const [shippingForm, setShippingForm] = useState<Partial<ShippingZone>>({});
  const [taxForm, setTaxForm] = useState<Partial<TaxRule>>({});

  useEffect(() => {
    let cancelled = false;
    const loadSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load all settings in parallel
        const [
          storeData,
          paymentData,
          shippingData,
          taxData
        ] = await Promise.all([
          settingsService.getStoreSettings(),
          settingsService.getPaymentMethods(),
          settingsService.getShippingZones(),
          settingsService.getTaxRules()
        ]);

        if (!cancelled) {
          setStoreSettings(storeData);
          setPaymentMethods(paymentData);
          setShippingZones(shippingData);
          setTaxRules(taxData);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar configuraciones');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSettings();
    return () => { cancelled = true; };
  }, []);

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingsService.updateStoreSettings(storeForm as any);
      // Refresh data
      const updated = await settingsService.getStoreSettings();
      setStoreSettings(updated);
      setStoreForm({});
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar configuración de tienda');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (paymentForm.id) {
        await settingsService.updatePaymentMethod(paymentForm.id, paymentForm as any);
      } else {
        // For new payment methods, we'd need a create method - simplified for now
        alert('Creación de nuevos métodos de pago requiere implementación adicional');
      }
      // Refresh data
      const updated = await settingsService.getPaymentMethods();
      setPaymentMethods(updated);
      setPaymentForm({});
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar método de pago');
    }
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (shippingForm.id) {
        await settingsService.updateShippingZone(shippingForm.id, shippingForm as any);
      } else {
        alert('Creación de nuevas zonas de envío requiere implementación adicional');
      }
      // Refresh data
      const updated = await settingsService.getShippingZones();
      setShippingZones(updated);
      setShippingForm({});
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar zona de envío');
    }
  };

  const handleTaxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (taxForm.id) {
        await settingsService.updateTaxRule(taxForm.id, taxForm as any);
      } else {
        alert('Creación de nuevas reglas de impuesto requiere implementación adicional');
      }
      // Refresh data
      const updated = await settingsService.getTaxRules();
      setTaxRules(updated);
      setTaxForm({});
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar regla de impuesto');
    }
  };

  const selectStoreSettings = () => {
    if (storeSettings) {
      setStoreForm({
        store_name: storeSettings.store_name,
        store_description: storeSettings.store_description,
        store_email: storeSettings.store_email,
        store_phone: storeSettings.store_phone,
        store_address: storeSettings.store_address,
        store_city: storeSettings.store_city,
        store_state: storeSettings.store_state,
        store_zip_code: storeSettings.store_zip_code,
        store_country: storeSettings.store_country,
        store_logo_url: storeSettings.store_logo_url,
        store_favicon_url: storeSettings.store_favicon_url,
        currency: storeSettings.currency,
        tax_rate: storeSettings.tax_rate,
        free_shipping_threshold: storeSettings.free_shipping_threshold,
        default_shipping_cost: storeSettings.default_shipping_cost,
        allow_guest_checkout: storeSettings.allow_guest_checkout,
        require_account_order: storeSettings.require_account_order,
        order_number_prefix: storeSettings.order_number_prefix,
        maintenance_mode: storeSettings.maintenance_mode,
        maintenance_message: storeSettings.maintenance_message,
        facebook_url: storeSettings.facebook_url,
        instagram_url: storeSettings.instagram_url,
        twitter_url: storeSettings.twitter_url,
        whatsapp_number: storeSettings.whatsapp_number,
        contact_email: storeSettings.contact_email,
        contact_phone: storeSettings.contact_phone
      });
    }
  };

  const selectPaymentMethod = (method: PaymentMethodSettings) => {
    setPaymentForm({
      id: method.id,
      method: method.method,
      is_active: method.is_active,
      title: method.title,
      description: method.description,
      config: method.config,
      sort_order: method.sort_order
    });
  };

  const selectShippingZone = (zone: ShippingZone) => {
    setShippingForm({
      id: zone.id,
      name: zone.name,
      countries: zone.countries,
      states: zone.states,
      zip_codes: zone.zip_codes,
      is_active: zone.is_active
    });
  };

  const selectTaxRule = (rule: TaxRule) => {
    setTaxForm({
      id: rule.id,
      name: rule.name,
      description: rule.description,
      rate: rule.rate,
      applies_to: rule.applies_to,
      product_ids: rule.product_ids,
      category_ids: rule.category_ids,
      is_active: rule.is_active
    });
  };

  const clearStoreForm = () => setStoreForm({});
  const clearPaymentForm = () => setPaymentForm({});
  const clearShippingForm = () => setShippingForm({});
  const clearTaxForm = () => setTaxForm({});

  return (
    <div className="admin-settings">
      <div className="page-header">
        <div>
          <h1>Configuración de la Tienda</h1>
          <p>Administra todos los aspectos de configuración de tu tienda en línea</p>
        </div>
        <div className="tab-tabs">
          <button
            className={`tab-tab ${activeTab === 'store' ? 'active' : ''}`}
            onClick={() => setActiveTab('store')}
          >
            Configuración General
          </button>
          <button
            className={`tab-tab ${activeTab === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            Métodos de Pago
          </button>
          <button
            className={`tab-tab ${activeTab === 'shipping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shipping')}
          >
            Envío
          </button>
          <button
            className={`tab-tab ${activeTab === 'tax' ? 'active' : ''}`}
            onClick={() => setActiveTab('tax')}
          >
            Impuestos
          </button>
        </div>
      </div>

      {error && <div className="admin-error">{error} <button onClick={() => setError(null)}>✕</button></div>}

      {/* Store Settings Tab */}
      {activeTab === 'store' && (
        <div className="settings-section">
          {storeSettings ? (
            <form onSubmit={handleStoreSubmit} className="settings-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre de la Tienda *</label>
                  <input
                    type="text"
                    value={storeForm.store_name || ''}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, store_name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Descripción de la Tienda</label>
                  <textarea
                    value={storeForm.store_description || ''}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, store_description: e.target.value }))}
                    rows={3}
                    placeholder="Describe tu tienda y lo que ofreces"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Correo Electrónico *</label>
                  <input
                    type="email"
                    value={storeForm.store_email || ''}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, store_email: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono *</label>
                  <input
                    type="tel"
                    value={storeForm.store_phone || ''}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, store_phone: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Dirección *</label>
                  <input
                    type="text"
                    value={storeForm.store_address || ''}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, store_address: e.target.value }))}
                    required
                    placeholder="Calle, número, colonia"
                  />
                </div>
                <div className="form-group">
                  <label>Ciudad *</label>
                  <input
                    type="text"
                    value={storeForm.store_city || ''}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, store_city: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Estado *</label>
                  <input
                    type="text"
                    value={storeForm.store_state || ''}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, store_state: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Código Postal *</label>
                  <input
                    type="text"
                    value={storeForm.store_zip_code || ''}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, store_zip_code: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>País *</label>
                  <input
                    type="text"
                    value={storeForm.store_country || ''}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, store_country: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Moneda *</label>
                  <input
                    type="text"
                    value={storeForm.currency || 'MXN'}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                    required
                    placeholder="MXN, USD, EUR"
                  />
                </div>
                <div className="form-group">
                  <label>Tasa de Impuesto (%) *</label>
                  <input
                    type="number"
                    value={storeForm.tax_rate || 16}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                    required
                    min="0"
                    max="100"
                    step="0.01"
                  />
                  <span className="form-unit">%</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Envío Gratis Desde</label>
                  <input
                    type="number"
                    value={storeForm.free_shipping_threshold || 1000}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, free_shipping_threshold: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                  />
                  <span className="form-unit">$</span>
                  <span className="form-help">0 = desactivado</span>
                </div>
                <div className="form-group">
                  <label>Costo de Envío Predeterminado</label>
                  <input
                    type="number"
                    value={storeForm.default_shipping_cost || 150}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, default_shipping_cost: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                  />
                  <span className="form-unit">$</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>
                    <input
                      type="checkbox"
                      checked={storeForm.allow_guest_checkout ?? true}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, allow_guest_checkout: e.target.checked }))}
                    />
                    Permitir compra como invitado
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>
                    <input
                      type="checkbox"
                      checked={storeForm.require_account_order ?? false}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, require_account_order: e.target.checked }))}
                    />
                    Requerir cuenta para realizar pedidos
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prefijo de Número de Orden</label>
                  <input
                    type="text"
                    value={storeForm.order_number_prefix || 'ORD'}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, order_number_prefix: e.target.value.toUpperCase() }))}
                    placeholder="Ej: ORD, INV, TKT"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>
                    <input
                      type="checkbox"
                      checked={storeForm.maintenance_mode ?? false}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, maintenance_mode: e.target.checked }))}
                    />
                    Modo mantenimiento
                  </label>
                </div>
                <div className="form-group">
                  <label>Mensaje de Mantenimiento</label>
                  <textarea
                    value={storeForm.maintenance_message || ''}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, maintenance_message: e.target.value }))}
                    rows={3}
                    placeholder="Mensaje mostrado cuando la tienda está en mantenimiento"
                    disabled={!(storeForm.maintenance_mode ?? false)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>URL del Logo</label>
                  <input
                    type="text"
                    value={storeForm.store_logo_url || ''}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, store_logo_url: e.target.value }))}
                    placeholder="https://ejemplo.com/logo.png"
                  />
                </div>
                <div className="form-group">
                  <label>URL del Favicon</label>
                  <input
                    type="text"
                    value={storeForm.store_favicon_url || ''}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, store_favicon_url: e.target.value }))}
                    placeholder="https://ejemplo.com/favicon.ico"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Facebook</label>
                  <input
                    type="text"
                    value={storeForm.facebook_url || ''}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, facebook_url: e.target.value }))}
                    placeholder="https://facebook.com/tutienda"
                  />
                </div>
                <div className="form-group">
                  <label>Instagram</label>
                  <input
                    type="text"
                    value={storeForm.instagram_url || ''}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, instagram_url: e.target.value }))}
                    placeholder="https://instagram.com/tutienda"
                  />
                </div>
                <div className="form-group">
                  <label>Twitter</label>
                  <input
                    type="text"
                    value={storeForm.twitter_url || ''}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, twitter_url: e.target.value }))}
                    placeholder="https://twitter.com/tutienda"
                  />
                </div>
                <div className="form-group">
                  <label>WhatsApp</label>
                  <input
                    type="tel"
                    value={storeForm.whatsapp_number || ''}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                    placeholder="+52 1 55 1234 5678"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Correo de Contacto</label>
                  <input
                    type="email"
                    value={storeForm.contact_email || ''}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, contact_email: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono de Contacto</label>
                  <input
                    type="tel"
                    value={storeForm.contact_phone || ''}
                    onChange={(e) => setStoreForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={clearStoreForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar Configuración
                </button>
              </div>
            </form>
          ) : (
            <div className="no-settings">
              <p>No se encontró configuración de tienda. Por favor, crea una configuración inicial.</p>
              <button className="btn-primary" onClick={() => {
                // Initialize with default values
                setStoreForm({
                  store_name: 'Mi Tienda',
                  store_email: 'contacto@mitienda.com',
                  store_phone: '+52 1 55 1234 5678',
                  store_address: 'Av. Ejemplo 123',
                  store_city: 'Ciudad de México',
                  store_state: 'CDMX',
                  store_zip_code: '01000',
                  store_country: 'México',
                  currency: 'MXN',
                  tax_rate: 16,
                  free_shipping_threshold: 1000,
                  default_shipping_cost: 150,
                  allow_guest_checkout: true,
                  require_account_order: false,
                  order_number_prefix: 'ORD',
                  maintenance_mode: false,
                  contact_email: 'contacto@mitienda.com',
                  contact_phone: '+52 1 55 1234 5678'
                });
              }}>
                Crear Configuración Inicial
              </button>
            </div>
          )}
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'payment' && (
        <div className="settings-section">
          <div className="section-header">
            <h2>Métodos de Pago</h2>
            <div className="header-actions">
              <button className="btn-outline" onClick={() => {
                setPaymentForm({});
                // In a real implementation, this would open a modal for creating new payment methods
                alert('Funcionalidad para agregar nuevos métodos de pago en desarrollo');
              }}>
                <i className="fa-solid fa-plus"></i> Nuevo Método de Pago
              </button>
            </div>
          </div>

          {paymentMethods.length > 0 ? (
            <div className="methods-table">
              <table>
                <thead>
                  <tr>
                    <th>Método</th>
                    <th>Título</th>
                    <th>Estado</th>
                    <th>Orden</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentMethods.map((method, index) => (
                    <tr key={method.id}>
                      <td>
                        <span className={`payment-method-icon ${method.method}`}>
                          {method.method === 'stripe' && <i className="fa-brands fa-stripe"></i>}
                          {method.method === 'paypal' && <i className="fa-brands fa-paypal"></i>}
                          {method.method === 'bank_transfer' && <i className="fa-solid fa-university"></i>}
                          {method.method === 'cash_on_delivery' && <i className="fa-solid fa-money-bill"></i>}
                        </span>
                        {method.method}
                      </td>
                      <td>{method.title}</td>
                      <td>
                        <span className={`status-badge ${method.is_active ? 'active' : 'inactive'}`}>
                          {method.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>{method.sort_order}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon edit" onClick={() => selectPaymentMethod(method)} title="Editar">
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          {method.id > 1 && (
                            <button className="btn-icon delete" onClick={() => {
                              if (window.confirm(`¿Estás seguro de eliminar el método de pago "${method.title}"?`)) {
                                // In a real implementation, we would call delete method
                                alert('Eliminación de métodos de pago requiere implementación adicional');
                              }
                            }} title="Eliminar">
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">
              <p>No se encontraron métodos de pago configurados.</p>
            </div>
          )}
        </div>
      )}

      {/* Shipping Tab */}
      {activeTab === 'shipping' && (
        <div className="settings-section">
          <div className="section-header">
            <h2>Zonas y Métodos de Envío</h2>
            <div className="header-actions">
              <button className="btn-outline" onClick={() => {
                setShippingForm({});
                alert('Funcionalidad para agregar nuevas zonas de envío en desarrollo');
              }}>
                <i className="fa-solid fa-plus"></i> Nueva Zona de Envío
              </button>
            </div>
          </div>

          {shippingZones.length > 0 ? (
            <div className="zones-accordion">
              {shippingZones.map((zone, index) => (
                <div key={zone.id} className="zone-card">
                  <div className="zone-header" onClick={() => {
                    // Toggle accordion (simplified - in reality would use state)
                  }}>
                    <h3>{zone.name}</h3>
                    <span className={`zone-status ${zone.is_active ? 'active' : 'inactive'}`}>
                      {zone.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                    <button className="zone-toggle">
                      <i className="fa-solid fa-chevron-down"></i>
                    </button>
                  </div>
                  <div className="zone-body">
                    <div className="zone-info">
                      <p><strong>Países:</strong> {zone.countries?.join(', ') || 'Ninguno'}</p>
                      {zone.states && zone.states.length > 0 && (
                        <p><strong>Estados/Provincias:</strong> {zone.states.join(', ')}</p>
                      )}
                      {zone.zip_codes && zone.zip_codes.length > 0 && (
                        <p><strong>Códigos Postales:</strong> {zone.zip_codes.join(', ')}</p>
                      )}
                    </div>
                    <div className="zone-methods">
                      <h4>Métodos de Envío ({zone.shipping_methods?.length || 0}):</h4>
                      {zone.shipping_methods?.map((method, idx) => (
                        <div key={idx} className="shipping-method-item">
                          <div className="method-info">
                            <strong>{method.name}</strong>
                            {method.description && <span className="method-description"> - {method.description}</span>}
                          </div>
                          <div className="method-details">
                            <span className="method-cost">$${method.cost.toFixed(2)}</span>
                            {method.free_over > 0 && (
                              <span className="method-free">Gratis sobre $${method.free_over.toFixed(2)}</span>
                            )}
                            <span className="method-time">{method.min_days}-{method.max_days} días</span>
                          </div>
                          <div className="method-status">
                            <span className={`status-badge ${method.is_active ? 'active' : 'inactive'}`}>
                              {method.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="zone-actions">
                    <button className="btn-icon edit" onClick={() => selectShippingZone(zone)} title="Editar Zona">
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    {zone.id > 1 && (
                      <button className="btn-icon delete" onClick={() => {
                        if (window.confirm(`¿Estás seguro de eliminar la zona de envío "${zone.name}"?`)) {
                          // In a real implementation, we would call delete method
                          alert('Eliminación de zonas de envío requiere implementación adicional');
                        }
                      }} title="Eliminar Zona">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>No se encontraron zonas de envío configuradas.</p>
            </div>
          )}
        </div>
      )}

      {/* Tax Tab */}
      {activeTab === 'tax' && (
        <div className="settings-section">
          <div className="section-header">
            <h2>Reglas de Impuesto</h2>
            <div className="header-actions">
              <button className="btn-outline" onClick={() => {
                setTaxForm({});
                alert('Funcionalidad para agregar nuevas reglas de impuesto en desarrollo');
              }}>
                <i className="fa-solid fa-plus"></i> Nueva Regla de Impuesto
              </button>
            </div>
          </div>

          {taxRules.length > 0 ? (
            <div className="tax-rules-table">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Tasa (%)</th>
                    <th>Aplica a</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {taxRules.map((rule, index) => (
                    <tr key={rule.id}>
                      <td>{rule.name}</td>
                      <td>{rule.description || '—'}</td>
                      <td>{rule.rate}%</td>
                      <td>
                        {rule.applies_to === 'all' && <span>Todos los productos</span>}
                        {rule.applies_to === 'specific_products' && (
                          <span>Productos específicos</span>
                        )}
                        {rule.applies_to === 'specific_categories' && (
                          <span>Categorías específicas</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${rule.is_active ? 'active' : 'inactive'}`}>
                          {rule.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon edit" onClick={() => selectTaxRule(rule)} title="Editar">
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          {rule.id > 1 && (
                            <button className="btn-icon delete" onClick={() => {
                              if (window.confirm(`¿Estás seguro de eliminar la regla de impuesto "${rule.name}"?`)) {
                                // In a real implementation, we would call delete method
                                alert('Eliminación de reglas de impuesto requiere implementación adicional');
                              }
                            }} title="Eliminar">
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">
              <p>No se encontraron reglas de impuesto configuradas.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSettings;