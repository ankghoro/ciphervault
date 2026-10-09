export default defineNuxtRouteMiddleware(async (to) => {
  const { token, fetchMe } = useAuth();
  const publicRoutes = ['/login', '/register'];

  if (!token.value && !publicRoutes.includes(to.path)) {
    return navigateTo('/login');
  }

  if (token.value && publicRoutes.includes(to.path)) {
    return navigateTo('/');
  }

  if (token.value) {
    await fetchMe();
  }
});
