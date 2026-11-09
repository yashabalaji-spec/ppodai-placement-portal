export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: { notifyUnauthorized?: boolean } = {}
): Promise<Response> {
  const response = await fetch(input, {
    ...init,
    credentials: init.credentials ?? 'same-origin'
  });

  const requestUrl = typeof input === 'string'
    ? input
    : input instanceof URL
      ? input.pathname
      : input.url;
  const shouldNotify = options.notifyUnauthorized !== false &&
    !requestUrl.includes('/api/auth/login') &&
    !requestUrl.includes('/api/auth/me') &&
    !requestUrl.includes('/api/auth/logout') &&
    !requestUrl.includes('/api/auth/forgot-password') &&
    !requestUrl.includes('/api/auth/reset-password');

  if (response.status === 401 && shouldNotify && typeof window !== 'undefined') {
    window.dispatchEvent(new Event('ppodai:session-expired'));
  }

  return response;
}
