import { useState, useEffect } from 'react';
import { reviewService } from '../services';
import { useAuth } from '../contexts';
import type { Review } from '../types';

export const useReviews = (productId: number | null) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    reviewService.getProductReviews(productId)
      .then(setReviews)
      .catch(err => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    if (!productId || !user) return;
    reviewService.hasUserReviewed(user.id, productId)
      .then(setHasReviewed)
      .catch(console.error);
  }, [productId, user]);

  const submitReview = async (rating: number, comment: string, title?: string) => {
    if (!productId || !user) return;
    try {
      setSubmitting(true);
      setError(null);
      const newReview = await reviewService.createReview({
        product_id: productId,
        user_id: user.id,
        rating,
        comment,
        title,
        verified_purchase: false,
      });
      setReviews(prev => [newReview, ...prev]);
      setHasReviewed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar reseña');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return { reviews, loading, submitting, hasReviewed, error, submitReview, avgRating };
};
