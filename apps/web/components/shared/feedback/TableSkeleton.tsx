import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-surface", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="h-12 px-4 text-left align-middle font-medium text-foreground-secondary [&:has([role=checkbox])]:pl-3">
                <div className="h-4 w-24 bg-surface-muted rounded animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <motion.tr
              key={rowIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: rowIndex * 0.05 }}
              className="border-b border-border last:border-b-0"
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="p-4 align-middle [&:has([role=checkbox])]:pl-3">
                  <div className="h-4 w-full bg-surface-muted rounded animate-pulse"></div>
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}