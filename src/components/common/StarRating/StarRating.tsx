import { useState } from 'react';
import './StarRating.css';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
}

export const StarRating = ({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showCount = false,
  count,
}: StarRatingProps) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className={`star-rating star-${size} ${readonly ? 'readonly' : 'interactive'}`}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= display ? 'filled' : ''}`}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          disabled={readonly}
          aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
        >
          <i className={star <= display ? 'fa-solid fa-star' : 'fa-regular fa-star'}></i>
        </button>
      ))}
      {showCount && count !== undefined && (
        <span className="star-count">({count})</span>
      )}
    </div>
  );
};
