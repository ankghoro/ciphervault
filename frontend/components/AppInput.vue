<template>
  <div class="space-y-1.5">
    <label v-if="label" class="block text-sm font-medium text-slate-700">
      {{ label }}
      <span v-if="required" class="text-rose-500">*</span>
    </label>
    <div class="relative">
      <input
        :type="actualType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50 disabled:text-slate-400"
        :class="{ 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20': error, 'pr-10': showPasswordToggle }"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="showPasswordToggle"
        type="button"
        class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
        @click="showPassword = !showPassword"
      >
        {{ showPassword ? 'Hide' : 'Show' }}
      </button>
    </div>
    <p v-if="error" class="text-xs text-rose-600">{{ error }}</p>
    <p v-else-if="helperText" class="text-xs text-slate-400">{{ helperText }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    label?: string;
    placeholder?: string;
    type?: string;
    error?: string;
    helperText?: string;
    showPasswordToggle?: boolean;
    required?: boolean;
    disabled?: boolean;
  }>(),
  {
    modelValue: '',
    label: '',
    placeholder: '',
    type: 'text',
    error: '',
    helperText: '',
    showPasswordToggle: false,
    required: false,
    disabled: false,
  },
);

defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const showPassword = ref(false);

const actualType = computed(() => {
  if (props.showPasswordToggle) return showPassword.value ? 'text' : 'password';
  return props.type;
});
</script>
