export type StrataFetchType = 'absolute' | 'distinct' | 'relative' | 'current' | 'live';

export interface StrataPagedData<T = Record<string, unknown>> {
  items: T[];
  skewPage: number;
  skewPerPage: number;
  skewTotal: number;
  skewTotalPages: number;
}

export interface StrataServiceResponse<T = Record<string, unknown>> {
  success: boolean;
  message?: string;
  errorCode?: string;
  data?: StrataPagedData<T>;
}

export async function fetchStrataResource<T = Record<string, unknown>>(
  resource: string,
  fetchtype: StrataFetchType = 'absolute',
  queryParams?: Record<string, string | number | boolean | undefined | null>
): Promise<StrataServiceResponse<T>> {
  const params = new URLSearchParams({ fetchtype });
  if (queryParams) {
    for (const [k, v] of Object.entries(queryParams)) {
      if (k !== 'fetchtype' && v !== undefined && v !== null && v !== '') {
        params.set(k, String(v));
      }
    }
  }

  const res = await fetch(`/api/strata/${encodeURIComponent(resource)}?${params.toString()}`, {
    method: 'GET',
    credentials: 'include',
  });

  const json = await res.json().catch(() => ({
    success: false,
    message: `Unexpected response (${res.status})`,
  }));

  if (!res.ok) {
    return {
      success: false,
      message: json?.message || `Failed to load ${resource} (${res.status})`,
      errorCode: json?.errorCode,
    };
  }

  return json as StrataServiceResponse<T>;
}
