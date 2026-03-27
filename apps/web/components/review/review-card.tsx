'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import StarRating from '../ui/star-rating';

interface ReviewCardProps {
  review: {
    id: string;
    reviewerName: string;
    rating: number;
    comment: string | null;
    createdAt: string;
  };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="p-4 bg-white border border-muted-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-900">{review.reviewerName}</p>
          <time className="text-xs text-muted-400" dateTime={review.createdAt}>
            {format(parseISO(review.createdAt), 'MMM d, yyyy')}
          </time>
        </div>
        <StarRating value={review.rating} size="sm" readonly />
      </div>
      {review.comment && (
        <div className="mt-2">
          <p className={`text-sm text-muted-600 ${!expanded ? 'line-clamp-3' : ''}`}>
            &ldquo;{review.comment}&rdquo;
          </p>
          {review.comment.length > 150 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              aria-expanded={expanded}
              className="text-xs text-primary-600 hover:text-primary-700 mt-1"
            >
              Read more
            </button>
          )}
        </div>
      )}
    </article>
  );
}
