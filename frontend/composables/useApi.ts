export function useApi() {
  const config = useRuntimeConfig();
  const token = useCookie<string | null>('cv_token', { maxAge: 60 * 60 * 24 * 7 });

  async function api<T>(
    path: string,
    options: {
      method?: string;
      body?: unknown;
      query?: Record<string, string | number | boolean | undefined>;
    } = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`;
    }

    const queryStr = options.query
      ? '?' +
        Object.entries(options.query)
          .filter(([, v]) => v !== undefined && v !== '')
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join('&')
      : '';

    try {
      return await $fetch<T>(`${config.public.apiBase}${path}${queryStr}`, {
        method: (options.method || 'GET') as any,
        body: options.body as any,
        headers,
      });
    } catch (err: any) {
      if (err?.statusCode === 401 || err?.response?.status === 401) {
        token.value = null;
        if (import.meta.client) {
          navigateTo('/login');
        }
      }
      const msg =
        err?.data?.message ||
        err?.data?.error ||
        (Array.isArray(err?.data?.message) ? err.data.message.join(', ') : null) ||
        err?.message ||
        'Request failed';
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  }

  return { api, token };
}
