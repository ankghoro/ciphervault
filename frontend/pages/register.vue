<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100 px-4">
    <div class="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
      <div class="text-center mb-6">
        <h1 class="text-xl font-semibold text-slate-900">Create account</h1>
        <p class="text-sm text-slate-500 mt-1">Start managing credentials securely</p>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <AppInput v-model="name" label="Name" placeholder="Your name" required />
        <AppInput v-model="email" label="Email" type="email" placeholder="you@company.com" required />
        <AppInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="Min. 8 characters"
          show-password-toggle
          required
        />
        <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>
        <AppButton type="submit" class="w-full" :loading="loading">Register</AppButton>
      </form>

      <p class="text-center text-sm text-slate-500 mt-5">
        Already have an account?
        <NuxtLink to="/login" class="text-indigo-600 hover:underline font-medium">Sign in</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'auth' });

const { register } = useAuth();
const name = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function submit() {
  loading.value = true;
  error.value = '';
  try {
    await register(email.value, name.value, password.value);
    navigateTo('/');
  } catch (e: any) {
    error.value = e.message || 'Registration failed';
  } finally {
    loading.value = false;
  }
}
</script>
