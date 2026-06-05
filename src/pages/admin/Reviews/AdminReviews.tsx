import { useState, useEffect } from 'react';
import { reviewService } from '../../../services';
import type { Review } from '../../../types';
import '../Products/AdminProducts.css';
import './AdminReviews.css';

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState<'todos' | 1 | 2 | 3 | 4 | 5>('todos');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'approved' | 'pending' | 'rejected'>('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [reviewPage, setReviewPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const loadReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real implementation, we would have pagination and filtering in the service
        // For now, we'll get all reviews and filter client-side
        const data = await reviewService.getProductReviews(0); // This would need to be modified to get all reviews
        // Actually, we need a method to get all reviews - let's simulate for now
        setReviews([]);
        setTotalPages(1);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar reseñas');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadReviews();
    return () => { cancelled = true; };
  }, []);

  const filteredReviews = reviews.filter(review => {
    const matchSearch = review.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      review.comment.toLowerCase().includes(search.toLowerCase());
    const matchRating = filterRating === 'todos' || review.rating === filterRating;
    // We don't have a status field in our Review type yet, but we could add one
    const matchStatus = true; // Simplified for now
    return matchSearch && matchRating && matchStatus;
  });

  const handleApproveReview = async (id: number) => {
    try {
      // In a real implementation, we would have an approval system
      // For now, we'll just simulate
      alert(`Reseña #${id} aprobada`);
      // Refresh the list
      const updatedReviews = reviews.map(review => 
        review.id === id ? { ...review, rating: review.rating } : review
      );
      setReviews(updatedReviews);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al aprobar reseña');
    }
  };

  const handleRejectReview = async (id: number) => {
    try {
      // In a real implementation, we would have a rejection system
      alert(`Reseña #${id} rechazada`);
      // Remove from list
      setReviews(reviews.filter(review => review.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al rechazar reseña');
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta reseña?')) return;
    try {
      await reviewService.deleteReview(id);
      setReviews(reviews.filter(review => review.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar reseña');
    }
  };

  if (error) {
    return (
      <div className="admin-reviews">
        <div className="admin-error">{error} <button onClick={() => setError(null)}>✕</button></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-reviews">
        <div className="loading-placeholder">
          <div className="placeholder"></div>
          <div className="placeholder"></div>
          <div className="placeholder"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-reviews">
      <div className="page-header">
        <div>
          <h1>Gestión de Reseñas de Productos</h1>
          <p>Administra y modera las reseñas de productos dejadas por tus clientes</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline" onClick={() => {
            // In a real implementation, this would open a modal for replying to reviews
            alert('Funcionalidad para responder a reseñas en desarrollo');
          }}>
            <i className="fa-solid fa-reply"></i> Responder a Reseña
          </button>
          <button className="btn-outline" onClick={() => {
            alert('Funcionalidad para exportar reseñas en desarrollo');
          }}>
            <i className="fa-solid fa-file-export"></i> Exportar
          </button>
        </div>
      </div>

      {error && <div className="admin-error">{error} <button onClick={() => setError(null)}>✕</button></div>}

      <div className="filters-bar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input type="text" placeholder="Buscar por cliente o comentario…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-group">
          <div className="filter-label">Calificación:</div>
          <div className="filter-tabs">
            {[{ label: 'Todas', value: 'todos' as const }, { label: '★1', value: 1 }, { label: '★2', value: 2 }, { label: '★3', value: 3 }, { label: '★4', value: 4 }, { label: '★5', value: 5 }].map(item => (
              <button
                key={String(item.value)}
                className={`filter-tab ${filterRating === (item.value as typeof filterRating) ? 'active' : ''}`}
                onClick={() => setFilterRating(item.value as typeof filterRating)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <div className="filter-label">Estado:</div>
          <div className="filter-tabs">
            {[{ label: 'Todos', value: 'todos' as const }, { label: 'Aprobadas', value: 'approved' as const }, { label: 'Pendientes', value: 'pending' as const }, { label: 'Rechazadas', value: 'rejected' as const }].map(item => (
              <button
                key={item.value}
                className={`filter-tab ${filterStatus === (item.value as typeof filterStatus) ? 'active' : ''}`}
                onClick={() => setFilterStatus(item.value as typeof filterStatus)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Calificación</th>
                <th>Comentario</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review, index) => (
                  <tr key={review.id}>
                    <td>
                      <div className="review-user">
                        <div className="review-avatar">
                          {review.user?.avatar_url ? (
                            <img src={review.user.avatar_url} alt={review.user.full_name} />
                          ) : (
                            <div className="review-avatar-bg">
                              {(review.user?.full_name || '?').charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="review-user-info">
                          <div className="review-user-name">{review.user?.full_name || 'Anónimo'}</div>
                          <div className="review-user-email">{(review.user as any)?.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="review-product-info">
                        <img 
                          src="/images/products/placeholder.jpg" 
                          alt="Producto" 
                          className="review-product-img"
                        />
                        <div className="review-product-name">
                          Producto #{review.product_id}
                        </div>
                      </div>
                    </td>
                    <td className="review-rating">
                      <div className="review-stars">
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i} 
                            className={`icon-star ${i < review.rating ? 'filled' : ''}`}
                          />
                        ))}
                      </div>
                      <span className="review-rating-number">{review.rating}/5</span>
                    </td>
                    <td className="review-comment">
                      <p className="review-comment-text">{review.comment}</p>
                      {review.title && (
                        <p className="review-title"><strong>{review.title}</strong></p>
                      )}
                    </td>
                    <td className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                    <td className="review-actions">
                      <div className="review-status-badge">
                        <span className={`status-badge ${/* review.status || */ 'approved'}`}>
                          {/* review.status || */ 'Aprobada'}
                        </span>
                      </div>
                      <div className="review-action-buttons">
                        <button 
                          className="btn-icon approve" 
                          onClick={() => handleApproveReview(review.id)}
                          title="Aprobar"
                        >
                          <i className="fa-solid fa-check"></i>
                        </button>
                        <button 
                          className="btn-icon reject" 
                          onClick={() => handleRejectReview(review.id)}
                          title="Rechazar"
                        >
                          <i className="fa-solid fa-times"></i>
                        </button>
                        <button 
                          className="btn-icon delete" 
                          onClick={() => handleDeleteReview(review.id)}
                          title="Eliminar"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="empty-state">
                    No se encontraron reseñas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="btn-page" 
              disabled={reviewPage === 1} 
              onClick={() => setReviewPage(p => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button 
                key={p} 
                className={`btn-page ${p === reviewPage ? 'active' : ''}`} 
                onClick={() => setReviewPage(p)}
              >
                {p}
              </button>
            ))}
            <button 
              className="btn-page" 
              disabled={reviewPage === totalPages} 
              onClick={() => setReviewPage(p => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;