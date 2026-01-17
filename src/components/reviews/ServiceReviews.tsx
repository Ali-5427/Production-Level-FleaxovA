
"use client"

import { useState, useEffect } from 'react';
import { getReviewsForService } from '@/lib/firebase/firestore';
import type { Review } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarRating } from './StarRating';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface ServiceReviewsProps {
  serviceId: string;
  refreshTrigger: number; // A prop to trigger re-fetch
}

export function ServiceReviews({ serviceId, refreshTrigger }: ServiceReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const fetchedReviews = await getReviewsForService(serviceId);
        setReviews(fetchedReviews);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchReviews();
    }
  }, [serviceId, refreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews ({reviews.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map(review => (
            <div key={review.id} className="flex gap-4">
              <Avatar>
                <AvatarImage src={review.reviewerAvatarUrl} alt={review.reviewerName} />
                <AvatarFallback>{review.reviewerName?.charAt(0) || 'R'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{review.reviewerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {review.createdAt ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) : ''}
                  </p>
                </div>
                <StarRating rating={review.rating} readonly size={16} className="my-1" />
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center">No reviews yet. Be the first to leave one!</p>
        )}
      </CardContent>
    </Card>
  );
}
