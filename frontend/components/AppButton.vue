<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
      sizeClass,
      variantClass,
    ]"
    @click="$emit('click', $event)"
  >
    <svg
      v-if="loading"
      class="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    loading: false,
  },
);

defineEmits<{ (e: 'click', ev: MouseEvent): void }>();

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-xs';
    case 'lg':
      return 'px-5 py-2.5 text-sm';
    default:
      return 'px-4 py-2 text-sm';
  }
});

const variantClass = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-300';
    case 'danger':
      return 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-400';
    case 'ghost':
      return 'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-300';
    default:
      return 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-400';
  }
});
</script>
