import React from 'react';
import { Skeleton, SkeletonText, SkeletonCircle } from './Skeleton';

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-app bg-grain">
      <div className="sticky top-20 z-40 bg-surface/80 backdrop-blur-md border-b border-subtle h-14 flex items-center px-6 lg:px-12">
        <div className="max-w-[1800px] mx-auto w-full flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <div className="hidden sm:flex items-center gap-8">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      <div className="editorial-grid max-w-[1920px] mx-auto">
        <div className="lg:h-[calc(100vh-8.5rem)] lg:sticky lg:top-[8.5rem] bg-surface-alt overflow-hidden border-r border-subtle">
          <Skeleton className="h-full w-full" />
          <div className="absolute bottom-10 left-10 flex gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="w-12 h-16" />
            ))}
          </div>
        </div>

        <div className="p-8 lg:p-20 lg:pt-32 space-y-20">
          <section className="space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-px w-8" />
                <Skeleton className="h-4 w-24" />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <Skeleton className="h-16 w-96" />
                <Skeleton className="w-16 h-16 rounded-full" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-10">
              <div className="space-y-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <SkeletonCircle key={i} size={14} />
                  ))}
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            <SkeletonText lines={3} className="max-w-xl" />

            <div className="p-8 border border-subtle bg-surface-alt rounded-none space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
              
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-0.5 w-full" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-0.5 w-full" />
                </div>
              </div>
              
              <Skeleton className="h-4 w-full" />
            </div>
          </section>

          <section className="space-y-12">
            <Skeleton className="h-px w-full" />
            
            <div className="space-y-8">
              <div>
                <Skeleton className="h-4 w-32 mb-6" />
                <div className="flex flex-wrap gap-4">
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Skeleton className="h-12 w-40" />
                <Skeleton className="flex-1 h-14 w-full" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </section>

          <section className="space-y-10">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
