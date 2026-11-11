import * as React from "react";
import { motion } from "framer-motion";
import { SkeletonCard } from "@/components/shared/feedback/SkeletonCard";
import { cn } from "@/lib/utils";

export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Skeleton */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div className="space-y-2">
          <div className="h-8 w-48 bg-surface-muted rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-surface-muted rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-surface-muted rounded animate-pulse"></div>
      </motion.div>
      
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="h-32">
            <div className="flex flex-col h-full justify-between">
              <div className="h-4 w-24 bg-surface-muted rounded animate-pulse"></div>
              <div className="h-8 w-16 bg-surface-muted rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-surface-muted rounded animate-pulse"></div>
            </div>
          </SkeletonCard>
        ))}
      </div>
      
      {/* Charts and Data Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonCard className="h-80">
            <div className="h-full flex items-center justify-center">
              <div className="h-16 w-16 bg-surface-muted rounded-full animate-pulse"></div>
            </div>
          </SkeletonCard>
        </div>
        <div>
          <SkeletonCard className="h-80">
            <div className="h-full flex flex-col justify-between">
              <div className="h-4 w-24 bg-surface-muted rounded animate-pulse"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-4 w-full bg-surface-muted rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </SkeletonCard>
        </div>
      </div>
      
      {/* Recent Activity */}
      <SkeletonCard className="h-64">
        <div className="h-4 w-32 bg-surface-muted rounded animate-pulse mb-4"></div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 bg-surface-muted rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-surface-muted rounded animate-pulse"></div>
                <div className="h-3 w-32 bg-surface-muted rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}