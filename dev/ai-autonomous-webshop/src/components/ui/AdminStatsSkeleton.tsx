import React from 'react';
import { Skeleton, SkeletonText, SkeletonCircle } from './Skeleton';

export function AdminStatsSkeleton() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-12">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass p-6 rounded-3xl">
            <div className="p-3 rounded-2xl bg-white/5 w-fit mb-4">
              <SkeletonCircle size={24} />
            </div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex gap-8">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-5 w-24" />
          ))}
        </div>
        <div className="p-6">
          <div className="w-full text-left">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5 mb-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-4 border-b border-white/5 last:border-0">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
