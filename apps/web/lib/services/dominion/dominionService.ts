export type DominionFetchType = 'absolute' | 'distinct' | 'relative' | 'discrete';

export async function fetchSubscriptionResource<T = Record<string, unknown>>(
  resource: 'packages' | 'items',
  fetchtype: DominionFetchType = 'discrete'
): Promise<{ success: boolean; items: T[]; message?: string }> {
  const res = await fetch(
    `/api/subscriptions/${resource}?fetchtype=${encodeURIComponent(fetchtype)}`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      success: false,
      items: [],
      message: json?.message || `Failed to load subscription ${resource}`,
    };
  }
  const items = json?.data?.items ?? json?.items ?? [];
  return {
    success: true,
    items: Array.isArray(items) ? (items as T[]) : [],
  };
}
