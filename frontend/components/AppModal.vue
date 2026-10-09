<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60"
      @click.self="close"
    >
      <div
        class="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        :class="sizeClass"
      >
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 class="text-base font-semibold text-slate-900">{{ title }}</h3>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
            @click="close"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="px-5 py-4 overflow-y-auto flex-1">
          <slot />
        </div>
        <div
          v-if="$slots.footer"
          class="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  { size: 'md' },
);

const emit = defineEmits<{ (e: 'update:modelValue', val: boolean): void }>();

function close() {
  emit('update:modelValue', false);
}

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'max-w-sm';
    case 'lg':
      return 'max-w-2xl';
    default:
      return 'max-w-lg';
  }
});
</script>
