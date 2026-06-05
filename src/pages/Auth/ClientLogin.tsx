import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Auth.css';

const ClientLogin = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-content">
          {/* Left Side - Image */}
          <div className="auth-image">
            <div className="image-overlay">
              <h2>¡Bienvenido de nuevo!</h2>
              <p>Inicia sesión para acceder a tu cuenta y disfrutar de todos nuestros beneficios</p>
              <div className="features-list">
                <div className="feature-item">
                  <i className="icon-check"></i>
                  <span>Seguimiento de pedidos</span>
                </div>
                <div className="feature-item">
                  <i className="icon-check"></i>
                  <span>Lista de deseos personalizada</span>
                </div>
                <div className="feature-item">
                  <i className="icon-check"></i>
                  <span>Ofertas exclusivas</span>
                </div>
                <div className="feature-item">
                  <i className="icon-check"></i>
                  <span>Historial de compras</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="auth-form-section">
            <div className="auth-form-container">
              <div className="auth-header">
                <h1>Iniciar Sesión</h1>
                <p>Ingresa tus credenciales para acceder a tu cuenta</p>
              </div>

              <Link to="/login" className="btn-submit full-width">
                Ir al Login de Clientes
              </Link>

              <div className="auth-footer">
                <p>
                  ¿No tienes una cuenta?{' '}
                  <Link to="/register">Regístrate aquí</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;