'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  fetchStrataResource,
  type StrataFetchType,
  type StrataPagedData,
} from '@/lib/services/strata/strataService';

export function useStrataResource<T = Record<string, unknown>>(
  resource: string,
  fetchtype: StrataFetchType = 'absolute',
  queryParams?: Record<string, string | number | boolean | undefined | null>,
  enabled = true
) {
  const [data, setData] = useState<StrataPagedData<T>>({
    items: [],
    skewPage: 1,
    skewPerPage: 20,
    skewTotal: 0,
    skewTotalPages: 0,
  });
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const queryKey = JSON.stringify(queryParams ?? {});

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const parsed = JSON.parse(queryKey) as Record<
        string,
        string | number | boolean | undefined | null
      >;
      const res = await fetchStrataResource<T>(resource, fetchtype, parsed);
      if (!res.success || !res.data) {
        setError(res.message || `Failed to load ${resource}`);
      } else {
        setData(res.data);
      }
    } catch {
      setError(`Unable to load ${resource}.`);
    } finally {
      setLoading(false);
    }
  }, [resource, fetchtype, queryKey, enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    items: data.items,
    pagination: {
      page: data.skewPage,
      perPage: data.skewPerPage,
      total: data.skewTotal,
      totalPages: data.skewTotalPages,
    },
    loading,
    error,
    reload,
  };
}
