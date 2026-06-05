import { useState, useEffect } from 'react';
import { loyaltyService } from '../../../services';
import type { LoyaltyProgram, UserLoyalty, LoyaltyTransaction } from '../../../services/loyaltyService';
import '../Products/AdminProducts.css';
import './AdminLoyalty.css';

const AdminLoyalty = () => {
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null);
  const [userLoyalty, setUserLoyalty] = useState<UserLoyalty | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'program' | 'users' | 'transactions'>('program');

  // Form states
  const [programForm, setProgramForm] = useState<Partial<LoyaltyProgram>>({});

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load loyalty program
        const programData = await loyaltyService.getLoyaltyProgram();
        if (!cancelled) setLoyaltyProgram(programData);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar programa de lealtad');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, []);

  const handleProgramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real implementation, we would have create/update methods
      // For now, we'll simulate saving
      alert('Guardando configuración de programa de lealtad...');
      // Refresh data
      const programData = await loyaltyService.getLoyaltyProgram();
      setLoyaltyProgram(programData);
      setProgramForm({});
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar programa de lealtad');
    }
  };

  return (
    <div className="admin-loyalty">
      <div className="page-header">
        <div>
          <h1>Programa de Lealtad y Recompensas</h1>
          <p>Administra el programa de puntos y recompensas para tus clientes</p>
        </div>
        <div className="tab-tabs">
          <button
            className={`tab-tab ${activeTab === 'program' ? 'active' : ''}`}
            onClick={() => setActiveTab('program')}
          >
            Configuración del Programa
          </button>
          <button
            className={`tab-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Usuarios y Puntos
          </button>
          <button
            className={`tab-tab ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Historial de Transacciones
          </button>
        </div>
      </div>

      {error && <div className="admin-error">{error} <button onClick={() => setError(null)}>✕</button></div>}

      {/* Program Configuration Tab */}
      {activeTab === 'program' && (
        <div className="settings-section">
          {loyaltyProgram ? (
            <form onSubmit={handleProgramSubmit} className="settings-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre del Programa *</label>
                  <input
                    type="text"
                    value={programForm.name || loyaltyProgram?.name || ''}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    value={programForm.description || loyaltyProgram?.description || ''}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Describe tu programa de lealtad"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Puntos por Compra (por unidad de moneda)</label>
                  <input
                    type="number"
                    value={programForm.points_per_purchase || loyaltyProgram?.points_per_purchase || 1}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, points_per_purchase: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                  />
                  <span className="form-help">Ej: 10 puntos por cada $1 gastado</span>
                </div>
                <div className="form-group">
                  <label>Puntos por Compartir en Redes Sociales</label>
                  <input
                    type="number"
                    value={programForm.points_per_social_share || loyaltyProgram?.points_per_social_share || 5}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, points_per_social_share: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Puntos por Dejar una Reseña</label>
                  <input
                    type="number"
                    value={programForm.points_per_review || loyaltyProgram?.points_per_review || 10}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, points_per_review: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Puntos por Referido Exitoso</label>
                  <input
                    type="number"
                    value={programForm.points_per_referral || loyaltyProgram?.points_per_referral || 50}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, points_per_referral: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Días hasta Expiración de Puntos</label>
                  <input
                    type="number"
                    value={programForm.points_expiry_days || loyaltyProgram?.points_expiry_days || 365}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, points_expiry_days: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                  <span className="form-help">0 = Los puntos nunca expiran</span>
                </div>
                <div className="form-group">
                  <label>Puntos Mínimos para Redención</label>
                  <input
                    type="number"
                    value={programForm.minimum_points_for_redemption || loyaltyProgram?.minimum_points_for_redemption || 100}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, minimum_points_for_redemption: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tasa de Redención (puntos por unidad de moneda)</label>
                  <input
                    type="number"
                    value={programForm.redemption_rate || loyaltyProgram?.redemption_rate || 100}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, redemption_rate: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                  />
                  <span className="form-help">Ej: 100 puntos = $1</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>
                    <input
                      type="checkbox"
                      checked={programForm.is_active ?? loyaltyProgram?.is_active ?? true}
                      onChange={(e) => setProgramForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    />
                    Programa activo
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={() => setProgramForm({})}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar Configuración
                </button>
              </div>
            </form>
          ) : (
            <div className="no-settings">
              <p>No se encontró configuración de programa de lealtad.</p>
              <button className="btn-primary" onClick={() => {
                // Initialize with default values
                setProgramForm({
                  name: 'Programa de Lealtad',
                  description: 'Gana puntos por cada compra y canjéalos por descuentos',
                  points_per_purchase: 10,
                  points_per_social_share: 5,
                  points_per_review: 10,
                  points_per_referral: 50,
                  points_expiry_days: 365,
                  minimum_points_for_redemption: 100,
                  redemption_rate: 100,
                  is_active: true
                });
              }}>
                Crear Configuración Inicial
              </button>
            </div>
          )}
        </div>
      )}

      {/* Users and Points Tab */}
      {activeTab === 'users' && (
        <div className="settings-section">
          <div className="section-header">
            <h2>Usuarios y Puntos</h2>
            <div className="header-actions">
              <button className="btn-outline" onClick={() => {
                setSelectedUserId(null);
                alert('Funcionalidad para buscar y seleccionar usuarios en desarrollo');
              }}>
                <i className="fa-solid fa-search"></i> Buscar Usuario
              </button>
              <button className="btn-outline" onClick={() => {
                alert('Funcionalidad para agregar puntos manualmente en desarrollo');
              }}>
                <i className="fa-solid fa-plus"></i> Agregar Puntos Manualmente
              </button>
            </div>
          </div>

          {selectedUserId ? (
            <div className="user-loyalty-detail">
              <div className="user-loyalty-header">
                <h3>Detalles de Lealtad del Usuario</h3>
                <button className="btn-outline" onClick={() => setSelectedUserId(null)}>
                  <i className="fa-solid fa-times"></i> Cerrar
                </button>
              </div>
              <div className="user-loyalty-content">
                {userLoyalty ? (
                  <>
                    <div className="loyalty-stats">
                      <div className="stat-item">
                        <h4>Balance Actual</h4>
                        <p className="stat-value">{userLoyalty.points_balance} puntos</p>
                      </div>
                      <div className="stat-item">
                        <h4>Puntos Pendientes</h4>
                        <p className="stat-value">{userLoyalty.points_pending} puntos</p>
                      </div>
                      <div className="stat-item">
                        <h4>Puntos Totales Ganados</h4>
                        <p className="stat-value">{userLoyalty.points_lifetime_earned} puntos</p>
                      </div>
                      <div className="stat-item">
                        <h4>Puntos Totales Redimidos</h4>
                        <p className="stat-value">{userLoyalty.points_lifetime_redeemed} puntos</p>
                      </div>
                    </div>
                    <div className="loyalty-actions">
                      <button className="btn-primary" onClick={() => {
                        alert('Funcionalidad para redimir puntos en desarrollo');
                      }}>
                        Redimir Puntos
                      </button>
                      <button className="btn-outline" onClick={() => {
                        alert('Funcionalidad para ajustar puntos en desarrollo');
                      }}>
                        Ajustar Puntos
                      </button>
                    </div>
                  </>
                ) : (
                  <p>Cargando información de lealtad del usuario...</p>
                )}
              </div>
            </div>
          ) : (
            <div className="users-table">
              <p>En una implementación completa, aquí se mostraría una lista de usuarios con sus balances de puntos.</p>
              <p>Esta funcionalidad requeriría integrarse con el servicio de usuarios para mostrar información detallada.</p>
            </div>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="settings-section">
          <div className="section-header">
            <h2>Historial de Transacciones de Lealtad</h2>
            <div className="header-actions">
              <button className="btn-outline" onClick={() => {
                alert('Funcionalidad para filtrar transacciones en desarrollo');
              }}>
                <i className="fa-solid fa-filter"></i> Filtrar
              </button>
              <button className="btn-outline" onClick={() => {
                alert('Funcionalidad para exportar transacciones en desarrollo');
              }}>
                <i className="fa-solid fa-file-export"></i> Exportar
              </button>
            </div>
          </div>

          <div className="transactions-table">
            <p>En una implementación completa, aquí se mostraría el historial detallado de transacciones de puntos para todos los usuarios.</p>
            <p>Esta tabla incluiría información como tipo de transacción, puntos ganados/pelidos, fecha, y descripciones.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLoyalty;