'use client';

import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md';
  readonly?: boolean;
}

const sizeMap = { sm: 'w-4 h-4', md: 'w-5 h-5' };

export default function StarRating({ value, onChange, size = 'md', readonly = false }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = hoverValue || value;
  const sizeClass = sizeMap[size];

  if (readonly) {
    return (
      <div className="flex items-center gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} className={`${sizeClass} ${star <= value ? 'text-yellow-400' : 'text-muted-200'}`} viewBox="0 0 20 20" fill="currentColor">
            {star <= value ? (
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            ) : (
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" fillOpacity="0" stroke="currentColor" strokeWidth="1" />
            )}
          </svg>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          className="p-0.5 transition-transform hover:scale-110"
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <svg className={`${sizeClass} ${star <= displayValue ? 'text-yellow-400' : 'text-muted-300'} transition-colors`} viewBox="0 0 20 20" fill="currentColor">
            {star <= displayValue ? (
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            ) : (
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" fillOpacity="0" stroke="currentColor" strokeWidth="1" />
            )}
          </svg>
        </button>
      ))}
    </div>
  );
}
