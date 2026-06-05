import { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal/Modal';
import { notificationService } from '../../../services';
import type { NotificationTemplate, Notification, NotificationSettings } from '../../../services';
import '../Products/AdminProducts.css';
import './AdminNotifications.css';

interface TemplateModalProps {
  open: boolean;
  onClose: () => void;
  template?: NotificationTemplate | null;
  onSave: (template: NotificationTemplate) => void;
}

const TemplateForm = ({ open, onClose, template, onSave }: TemplateModalProps) => {
  const [formData, setFormData] = useState<Partial<NotificationTemplate>>(template || {
    name: '',
    description: '',
    subject: '',
    body: '',
    type: 'email',
    is_active: true,
    variables: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData(template);
    } else {
      setFormData({
        name: '',
        description: '',
        subject: '',
        body: '',
        type: 'email',
        is_active: true,
        variables: [],
      });
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (template) {
        const updated = await notificationService.updateNotificationTemplate(template.id, formData);
        onSave(updated);
      } else {
        const created = await notificationService.createNotificationTemplate(formData as Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>);
        onSave(created);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={template ? 'Editar Plantilla' : 'Nueva Plantilla'} size="lg">
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Tipo *</label>
            <select
              value={formData.type || 'email'}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              required
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="push">Push</option>
              <option value="in_app">En App</option>
            </select>
          </div>
        </div>

        <div className="form-group full-width">
          <label>Descripción</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            placeholder="Descripción de la plantilla"
          />
        </div>

        <div className="form-group full-width">
          <label>Asunto/Subject</label>
          <input
            type="text"
            value={formData.subject || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Asunto del mensaje (para email/SMS)"
          />
        </div>

        <div className="form-group full-width">
          <label>Cuerpo/Body *</label>
          <textarea
            value={formData.body || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
            rows={5}
            placeholder="Contenido del mensaje. Usa {{variable}} para placeholders."
            required
          />
        </div>

        <div className="form-group full-width">
          <label>Variables (una por línea)</label>
          <textarea
            value={(formData.variables || []).join('\n')}
            onChange={(e) => setFormData(prev => ({ ...prev, variables: e.target.value.split('\n').filter(v => v.trim()) }))}
            rows={3}
            placeholder="customer_name&#10;order_number&#10;total"
          />
        </div>

        <div className="form-group full-width">
          <label>
            <input
              type="checkbox"
              checked={formData.is_active ?? true}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            />
            Plantilla activa
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-outline" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const AdminNotifications = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'history' | 'settings'>('templates');
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);

  const [templateForm, setTemplateForm] = useState<Partial<NotificationTemplate>>({});
  const [settingsForm, setSettingsForm] = useState<Partial<NotificationSettings>>({});

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [templateData, notificationData, settingsData] = await Promise.all([
          notificationService.getNotificationTemplates(),
          notificationService.getUserNotifications(''),
          notificationService.getNotificationSettings()
        ]);

        if (!cancelled) {
          setTemplates(templateData);
          setNotifications(notificationData);
          setSettings(settingsData);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar datos de notificaciones');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, []);

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const templateData = await notificationService.getNotificationTemplates();
      setTemplates(templateData);
      setTemplateForm({});
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar plantilla de notificación');
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const settingsData = await notificationService.getNotificationSettings();
      setSettings(settingsData);
      setSettingsForm({});
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar configuración de notificaciones');
    }
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setTemplateModalOpen(true);
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setTemplateModalOpen(true);
  };

  const handleTemplateSave = (updatedTemplate: NotificationTemplate) => {
    setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    setTemplates(prev => {
      const exists = prev.find(t => t.id === updatedTemplate.id);
      if (exists) return prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t);
      return [...prev, updatedTemplate];
    });
  };

  return (
    <div className="admin-notifications">
      <div className="page-header">
        <div>
          <h1>Gestión de Notificaciones</h1>
          <p>Administra plantillas, historial y configuración de notificaciones para tu tienda</p>
        </div>
      </div>

      <div className="tab-tabs">
        <button
          className={`tab-tab ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          Plantillas
        </button>
        <button
          className={`tab-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Historial de Notificaciones
        </button>
        <button
          className={`tab-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Configuración
        </button>
      </div>

      {error && <div className="admin-error">{error} <button onClick={() => setError(null)}>✕</button></div>}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="settings-section">
          <div className="section-header">
            <h2>Plantillas de Notificación</h2>
            <div className="header-actions">
              <button className="btn-outline" onClick={handleNewTemplate}>
                <i className="fa-solid fa-plus"></i> Nueva Plantilla
              </button>
            </div>
          </div>

          {templates.length > 0 ? (
            <div className="templates-table">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Variables</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <tr key={template.id}>
                      <td>{template.name}</td>
                      <td>{template.description || '—'}</td>
                      <td>
                        <span className={`notification-type ${template.type}`}>
                          {template.type === 'email' && (<><i className="fa-solid fa-envelope"></i> Email</>)}
                          {template.type === 'sms' && (<><i className="fa-solid fa-phone"></i> SMS</>)}
                          {template.type === 'push' && (<><i className="fa-solid fa-mobile-alt"></i> Push</>)}
                          {template.type === 'in_app' && (<><i className="fa-solid fa-bell"></i> En App</>)}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${template.is_active ? 'active' : 'inactive'}`}>
                          {template.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        {template.variables?.length > 0 ? (
                          <span className="template-variables">
                            {template.variables.map((v, idx) => (
                              <span key={idx} className="template-variable">{v}</span>
                            ))}
                          </span>
                        ) : (
                          <span className="template-variables">Ninguna</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon edit" onClick={() => handleEditTemplate(template)} title="Editar">
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          {template.id > 1 && (
                            <button className="btn-icon delete" onClick={() => {
                              if (window.confirm(`¿Estás seguro de eliminar la plantilla "${template.name}"?`)) {
                                notificationService.deleteNotificationTemplate(template.id);
                                setTemplates(prev => prev.filter(t => t.id !== template.id));
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
              <p>No se encontraron plantillas de notificación configuradas.</p>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="settings-section">
          <div className="section-header">
            <h2>Historial de Notificaciones</h2>
            <div className="header-actions">
              <button className="btn-outline" onClick={() => alert('Funcionalidad para filtrar historial en desarrollo')}>
                <i className="fa-solid fa-filter"></i> Filtrar
              </button>
              <button className="btn-outline" onClick={() => alert('Funcionalidad para exportar historial en desarrollo')}>
                <i className="fa-solid fa-file-export"></i> Exportar
              </button>
            </div>
          </div>

          <div className="notifications-table">
            {notifications.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notification) => (
                    <tr key={notification.id}>
                      <td>
                        {notification.user_id.substring(0, 8)}...
                      </td>
                      <td>
                        <span className={`notification-type ${notification.type}`}>
                          {notification.type === 'email' && <><i className="fa-solid fa-envelope"></i> Email</>}
                          {notification.type === 'sms' && <><i className="fa-solid fa-phone"></i> SMS</>}
                          {notification.type === 'push' && <><i className="fa-solid fa-mobile-alt"></i> Push</>}
                          {notification.type === 'in_app' && <><i className="fa-solid fa-bell"></i> En App</>}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${notification.status}`}>
                          {notification.status === 'pending' && 'Pendiente'}
                          {notification.status === 'sent' && 'Enviado'}
                          {notification.status === 'failed' && 'Fallido'}
                          {notification.status === 'delivered' && 'Entregado'}
                          {notification.status === 'read' && 'Leído'}
                        </span>
                      </td>
                      <td>
                        {new Date(notification.created_at).toLocaleString()}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" onClick={() => alert('Ver detalles en desarrollo')} title="Ver">
                            <i className="fa-solid fa-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">
                <p>No se encontraron notificaciones en el historial.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="settings-section">
          {settings ? (
            <form onSubmit={handleSettingsSubmit} className="settings-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Correo Remitente *</label>
                  <input
                    type="email"
                    value={settingsForm.email_from || settings?.email_from || ''}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, email_from: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nombre del Remitente *</label>
                  <input
                    type="text"
                    value={settingsForm.email_from_name || settings?.email_from_name || ''}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, email_from_name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Servidor SMTP</label>
                  <input
                    type="text"
                    value={settingsForm.smtp_host || settings?.smtp_host || ''}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, smtp_host: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Puerto SMTP</label>
                  <input
                    type="number"
                    value={settingsForm.smtp_port || settings?.smtp_port || 587}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, smtp_port: parseInt(e.target.value) || 0 }))}
                    min="1"
                    max="65535"
                  />
                </div>
                <div className="form-group">
                  <label>Usuario SMTP</label>
                  <input
                    type="text"
                    value={settingsForm.smtp_user || settings?.smtp_user || ''}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, smtp_user: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Contraseña SMTP</label>
                  <input
                    type="password"
                    value={settingsForm.smtp_pass || settings?.smtp_pass || ''}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, smtp_pass: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Proveedor SMS</label>
                  <input
                    type="text"
                    value={settingsForm.sms_provider || settings?.sms_provider || ''}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, sms_provider: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono Remitente SMS</label>
                  <input
                    type="tel"
                    value={settingsForm.sms_from || settings?.sms_from || ''}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, sms_from: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Proveedor Push</label>
                  <input
                    type="text"
                    value={settingsForm.push_provider || settings?.push_provider || ''}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, push_provider: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Configuración Push (JSON)</label>
                  <textarea
                    value={settingsForm.push_config ? JSON.stringify(settingsForm.push_config, null, 2) : settings?.push_config ? JSON.stringify(settings?.push_config, null, 2) : ''}
                    onChange={(e) => {
                      try {
                        const value = JSON.parse(e.target.value);
                        setSettingsForm(prev => ({ ...prev, push_config: value }));
                      } catch {
                        // Ignore invalid JSON for now
                      }
                    }}
                    rows={5}
                    placeholder='{"key": "value"}'
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>
                    <input
                      type="checkbox"
                      checked={settingsForm.is_email_enabled ?? settings?.is_email_enabled ?? true}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, is_email_enabled: e.target.checked }))}
                    />
                    Habilitar notificaciones por email
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>
                    <input
                      type="checkbox"
                      checked={settingsForm.is_sms_enabled ?? settings?.is_sms_enabled ?? false}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, is_sms_enabled: e.target.checked }))}
                    />
                    Habilitar notificaciones por SMS
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>
                    <input
                      type="checkbox"
                      checked={settingsForm.is_push_enabled ?? settings?.is_push_enabled ?? false}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, is_push_enabled: e.target.checked }))}
                    />
                    Habilitar notificaciones push
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={() => setSettingsForm({})}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar Configuración
                </button>
              </div>
            </form>
          ) : (
            <div className="no-settings">
              <p>No se encontró configuración de notificaciones.</p>
              <button className="btn-primary" onClick={() => {
                setSettingsForm({
                  email_from: 'notificaciones@tutienda.com',
                  email_from_name: 'Tienda Notificaciones',
                  smtp_host: 'smtp.example.com',
                  smtp_port: 587,
                  smtp_user: 'notificaciones@tutienda.com',
                  smtp_pass: 'password',
                  sms_provider: 'twilio',
                  sms_from: '+1234567890',
                  push_provider: 'firebase',
                  push_config: {
                    apiKey: 'your-api-key',
                    authDomain: 'your-project.firebaseapp.com',
                    projectId: 'your-project-id'
                  },
                  is_email_enabled: true,
                  is_sms_enabled: false,
                  is_push_enabled: true
                });
              }}>
                Crear Configuración Inicial
              </button>
            </div>
          )}
        </div>
      )}

      <TemplateForm
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        template={editingTemplate}
        onSave={handleTemplateSave}
      />
    </div>
  );
};

export default AdminNotifications;