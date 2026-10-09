<template>
  <span
    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border"
    :class="colorClass"
    :style="customStyle"
  >
    <span
      v-if="dot"
      class="w-1.5 h-1.5 rounded-full shrink-0"
      :style="dotStyle"
      :class="!colorHex ? 'bg-current' : ''"
    />
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    color?: string;
    colorHex?: string;
    dot?: boolean;
  }>(),
  { color: 'slate', colorHex: '', dot: false },
);

const colorClass = computed(() => {
  if (props.colorHex) {
    return 'bg-opacity-10 border-opacity-30';
  }
  const map: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };
  return map[props.color] || 'bg-slate-100 text-slate-700 border-slate-200';
});

const customStyle = computed(() => {
  if (!props.colorHex) return {};
  return {
    backgroundColor: `${props.colorHex}18`,
    color: props.colorHex,
    borderColor: `${props.colorHex}40`,
  };
});

const dotStyle = computed(() =>
  props.colorHex ? { backgroundColor: props.colorHex } : {},
);
</script>
