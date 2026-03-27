'use client';

import { useState, useEffect } from 'react';
import StarRating from '../ui/star-rating';
import ReviewCard from './review-card';
import { api } from '../../lib/api-client';

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface ReviewsData {
  data: Review[];
  meta: { averageRating: number; reviewCount: number; total: number };
}

export default function ReviewsSection({ serviceId }: { serviceId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [meta, setMeta] = useState({ averageRating: 0, reviewCount: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const result = (await api.getServiceReviews(serviceId)) as ReviewsData;
        setReviews(result.data || []);
        setMeta(result.meta || { averageRating: 0, reviewCount: 0, total: 0 });
      } catch {
        // Silently fail — reviews are supplementary
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="mt-6 pt-6 border-t border-muted-200">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-muted-200 rounded w-32" />
          <div className="h-20 bg-muted-100 rounded" />
          <div className="h-20 bg-muted-100 rounded" />
        </div>
      </div>
    );
  }

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);
  const showThreshold = meta.reviewCount >= 5;

  return (
    <div className="mt-6 pt-6 border-t border-muted-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-muted-900">
          Reviews {meta.reviewCount > 0 && `(${meta.reviewCount})`}
        </h2>
        {showThreshold && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-700">Overall</span>
            <StarRating value={Math.round(meta.averageRating)} size="sm" readonly />
            <span className="text-sm font-semibold text-muted-900">{meta.averageRating}</span>
          </div>
        )}
      </div>

      {meta.reviewCount === 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-500">No reviews yet. Be the first to book and share your experience.</p>
        </div>
      )}

      {meta.reviewCount > 0 && (
        <div className="space-y-3">
          {displayedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          {!showAll && meta.total > 3 && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
            >
              Show all {meta.total} reviews
            </button>
          )}
        </div>
      )}
    </div>
  );
}
