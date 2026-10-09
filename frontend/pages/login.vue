<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100 px-4">
    <div class="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
      <div class="text-center mb-6">
        <div class="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 class="text-xl font-semibold text-slate-900">Sign in</h1>
        <p class="text-sm text-slate-500 mt-1">CipherVault credential manager</p>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <AppInput v-model="email" label="Email" type="email" placeholder="you@company.com" required />
        <AppInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="********"
          show-password-toggle
          required
        />
        <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>
        <AppButton type="submit" class="w-full" :loading="loading">Sign in</AppButton>
      </form>

      <p class="text-center text-sm text-slate-500 mt-5">
        No account?
        <NuxtLink to="/register" class="text-indigo-600 hover:underline font-medium">Register</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'auth' });

const { login } = useAuth();
const email = ref('admin@ciphervault.sample');
const password = ref('password123');
const loading = ref(false);
const error = ref('');

async function submit() {
  loading.value = true;
  error.value = '';
  try {
    await login(email.value, password.value);
    navigateTo('/');
  } catch (e: any) {
    error.value = e.message || 'Login failed';
  } finally {
    loading.value = false;
  }
}
</script>
