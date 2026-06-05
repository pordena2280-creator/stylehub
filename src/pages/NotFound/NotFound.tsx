import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1>Página No Encontrada</h1>
        <p>Lo sentimos, la página que buscas no existe o fue movida.</p>
        <div className="not-found-actions">
          <Link to="/" className="btn-home">🏠 Ir al Inicio</Link>
          <Link to="/products" className="btn-shop">🛍️ Ver Productos</Link>
        </div>
        <div className="not-found-links">
          <Link to="/contact">Contacto</Link>
          <Link to="/faq">Preguntas Frecuentes</Link>
          <Link to="/blog">Blog</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
