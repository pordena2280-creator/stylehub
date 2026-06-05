import { useState, useEffect } from 'react';
import { affiliateService } from '../../../services';
import type { AffiliateProgram, Affiliate, Referral } from '../../../services/affiliateService';
import '../Products/AdminProducts.css';
import './AdminAffiliates.css';

const AdminAffiliates = () => {
  const [affiliateProgram, setAffiliateProgram] = useState<AffiliateProgram | null>(null);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'program' | 'affiliates' | 'referrals'>('program');

  // Form states
  const [programForm, setProgramForm] = useState<Partial<AffiliateProgram>>({});
  const [affiliateForm, setAffiliateForm] = useState<Partial<Affiliate>>({});

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load all data in parallel
        const [
          programData,
          affiliateData,
          referralData
        ] = await Promise.all([
          affiliateService.getAffiliateProgram(),
          // In a real implementation, we would get all affiliates
          // For now, we'll get an empty array and simulate
          [],
          // In a real implementation, we would get all referrals
          // For now, we'll get an empty array and simulate
          []
        ]);

        if (!cancelled) {
          setAffiliateProgram(programData);
          setAffiliates(affiliateData);
          setReferrals(referralData);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar datos de afiliados');
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
      alert('Guardando configuración de programa de afiliados...');
      // Refresh data
      const programData = await affiliateService.getAffiliateProgram();
      setAffiliateProgram(programData);
      setProgramForm({});
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar programa de afiliados');
    }
  };

  return (
    <div className="admin-affiliates">
      <div className="page-header">
        <div>
          <h1>Programa de Afiliados y Referidos</h1>
          <p>Administra tu programa de marketing de afiliados y sistema de referidos</p>
        </div>
      </div>

      <div className="tab-tabs">
        <button
          className={`tab-tab ${activeTab === 'program' ? 'active' : ''}`}
          onClick={() => setActiveTab('program')}
        >
          Configuración del Programa
        </button>
        <button
          className={`tab-tab ${activeTab === 'affiliates' ? 'active' : ''}`}
          onClick={() => setActiveTab('affiliates')}
        >
          Afiliados
        </button>
        <button
          className={`tab-tab ${activeTab === 'referrals' ? 'active' : ''}`}
          onClick={() => setActiveTab('referrals')}
        >
          Referidos
        </button>
      </div>

      {error && <div className="admin-error">{error} <button onClick={() => setError(null)}>✕</button></div>}

      {/* Program Configuration Tab */}
      {activeTab === 'program' && (
        <div className="settings-section">
          {affiliateProgram ? (
            <form onSubmit={handleProgramSubmit} className="settings-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre del Programa *</label>
                  <input
                    type="text"
                    value={programForm.name || affiliateProgram?.name || ''}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    value={programForm.description || affiliateProgram?.description || ''}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Describe tu programa de afiliados"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Comisión *</label>
                  <select
                    value={programForm.commission_type || affiliateProgram?.commission_type || 'percentage'}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, commission_type: e.target.value as any }))}
                    required
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Valor de Comisión *</label>
                  <input
                    type="number"
                    value={programForm.commission_value || affiliateProgram?.commission_value || 5}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, commission_value: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                  />
                  <span className="form-unit">{programForm.commission_type === 'percentage' ? '%' : '$'}</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duración de Cookie (días)</label>
                  <input
                    type="number"
                    value={programForm.cookie_duration_days || affiliateProgram?.cookie_duration_days || 30}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, cookie_duration_days: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                  <span className="form-help">0 = sesión del navegador</span>
                </div>
                <div className="form-group">
                  <label>Pago Mínimo</label>
                  <input
                    type="number"
                    value={programForm.minimum_payout || affiliateProgram?.minimum_payout || 100}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, minimum_payout: parseFloat(e.target.value) || 0 }))}
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
                      checked={programForm.is_active ?? affiliateProgram?.is_active ?? true}
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
              <p>No se encontró configuración de programa de afiliados.</p>
              <button className="btn-primary" onClick={() => {
                // Initialize with default values
                setProgramForm({
                  name: 'Programa de Afiliados',
                  description: 'Gana comisiones por referir nuevos clientes',
                  commission_type: 'percentage',
                  commission_value: 10,
                  cookie_duration_days: 30,
                  minimum_payout: 100,
                  is_active: true
                });
              }}>
                Crear Configuración Inicial
              </button>
            </div>
          )}
        </div>
      )}

      {/* Affiliates Tab */}
      {activeTab === 'affiliates' && (
        <div className="settings-section">
          <div className="section-header">
            <h2>Afiliados</h2>
            <div className="header-actions">
              <button className="btn-outline" onClick={() => {
                setAffiliateForm({});
                alert('Funcionalidad para agregar nuevo afiliado en desarrollo');
              }}>
                <i className="fa-solid fa-plus"></i> Nuevo Afiliado
              </button>
            </div>
          </div>

          <div className="affiliates-table">
            <p>En una implementación completa, aquí se mostraría una lista de todos los afiliados registrados con sus estadísticas de rendimiento.</p>
            <p>Esta tabla incluiría información como código de afiliado, comisiones ganadas, número de referidos, tasa de conversión, y más.</p>
          </div>
        </div>
      )}

      {/* Referrals Tab */}
      {activeTab === 'referrals' && (
        <div className="settings-section">
          <div className="section-header">
            <h2>Referidos y Conversiones</h2>
            <div className="header-actions">
              <button className="btn-outline" onClick={() => {
                alert('Funcionalidad para filtrar referidos en desarrollo');
              }}>
                <i className="fa-solid fa-filter"></i> Filtrar
              </button>
              <button className="btn-outline" onClick={() => {
                alert('Funcionalidad para exportar referidos en desarrollo');
              }}>
                <i className="fa-solid fa-file-export"></i> Exportar
              </button>
            </div>
          </div>

          <div className="referrals-table">
            <p>En una implementación completa, aquí se mostraría el historial detallado de todos los referidos realizados por afiliados.</p>
            <p>Esta tabla incluiría información como fecha de referido, email referido, estado de conversión, comisión ganada, y más.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAffiliates;