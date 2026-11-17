'use client';

import { useEffect, useState } from 'react';
import {
  fetchSubscriptionResource,
  type DominionFetchType,
} from '@/lib/services/dominion/dominionService';

export function useSubscriptionPackages<T = Record<string, unknown>>(
  resource: 'packages' | 'items' = 'packages',
  fetchtype: DominionFetchType = 'discrete'
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const res = await fetchSubscriptionResource<T>(resource, fetchtype);
      if (!active) return;
      if (!res.success) {
        setError(res.message ?? null);
      }
      setItems(res.items);
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, [resource, fetchtype]);

  return { items, loading, error };
}
