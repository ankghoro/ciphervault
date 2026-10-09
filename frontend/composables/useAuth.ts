import type { User } from '~/types';

export function useAuth() {
  const { api, token } = useApi();
  const user = useState<User | null>('auth_user', () => null);

  async function login(email: string, password: string) {
    const res = await api<{ user: User; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    token.value = res.accessToken;
    user.value = res.user;
    return res;
  }

  async function register(email: string, name: string, password: string) {
    const res = await api<{ user: User; accessToken: string }>('/auth/register', {
      method: 'POST',
      body: { email, name, password },
    });
    token.value = res.accessToken;
    user.value = res.user;
    return res;
  }

  async function fetchMe() {
    if (!token.value) {
      user.value = null;
      return null;
    }
    try {
      user.value = await api<User>('/auth/me');
      return user.value;
    } catch {
      token.value = null;
      user.value = null;
      return null;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    navigateTo('/login');
  }

  const isLoggedIn = computed(() => !!token.value);

  return { user, login, register, fetchMe, logout, isLoggedIn, token };
}
