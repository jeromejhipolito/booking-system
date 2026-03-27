'use client';

import { useState } from 'react';
import StarRating from '../ui/star-rating';
import { api } from '../../lib/api-client';

interface ReviewFormProps {
  bookingId: string;
  onSuccess: (rating: number) => void;
  onCancel: () => void;
}

export default function ReviewForm({ bookingId, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    setError('');
    try {
      await api.createReview({ bookingId, rating, comment: comment.trim() || undefined });
      onSuccess(rating);
    } catch (err: any) {
      if (err.message?.includes('already reviewed') || err.message?.includes('Conflict')) {
        setError('This booking has already been reviewed.');
      } else {
        setError(err.message || 'Failed to submit review.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-3 p-4 bg-muted-50 rounded-lg border border-muted-200">
      <p className="text-sm font-medium text-muted-700 mb-3">How was your experience?</p>
      <StarRating value={rating} onChange={setRating} size="md" />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment (optional)"
        maxLength={500}
        rows={3}
        className="input-field mt-3 resize-none text-sm"
      />
      {error && <p className="text-sm text-danger-600 mt-2">{error}</p>}
      <div className="flex justify-end gap-2 mt-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-muted-600 hover:bg-muted-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}
