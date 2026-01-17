
"use client"

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  className?: string;
  readonly?: boolean;
}

export function StarRating({ rating, onRatingChange, size = 20, className, readonly = false }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const totalStars = 5;

  return (
    <div className={cn("flex items-center gap-1", className, !readonly && "cursor-pointer")}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={index}
            className={cn(
              "transition-colors",
              starValue <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            )}
            size={size}
            onClick={() => !readonly && onRatingChange?.(starValue)}
            onMouseEnter={() => !readonly && setHoverRating(starValue)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
          />
        );
      })}
    </div>
  );
}
