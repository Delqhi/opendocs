import React from 'react';
import { Skeleton, SkeletonText, SkeletonCircle } from './Skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="bg-transparent">
      <div className="aspect-[4/5] overflow-hidden bg-surface-alt mb-6 rounded-none">
        <Skeleton className="h-full w-full" />
      </div>
      
      <div className="text-center px-4 space-y-2">
        <div className="flex flex-col items-center gap-1.5 mb-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        
        <Skeleton className="h-4 w-3/4 mx-auto" />
        
        <div className="flex items-center justify-center gap-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <SkeletonCircle key={i} size={8} />
            ))}
          </div>
          <div className="h-px w-4 bg-border mx-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}
