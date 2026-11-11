import * as React from "react";

export function useSkeleton(count: number = 1) {
  const skeletons = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => (
      <div key={i} className="animate-pulse bg-surface-muted rounded h-4 w-full" />
    ));
  }, [count]);
  
  return skeletons;
}