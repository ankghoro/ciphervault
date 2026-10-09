<template>
  <div>
    <NuxtLink
      :to="{ path: '/', query: { groupId: group.id } }"
      class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
      :class="[
        isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50',
      ]"
      :style="{ paddingLeft: `${12 + depth * 12}px` }"
    >
      <svg class="w-3.5 h-3.5 shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
      <span class="truncate">{{ group.name }}</span>
      <span v-if="group._count?.credentials" class="ml-auto text-[10px] text-slate-400">
        {{ group._count.credentials }}
      </span>
    </NuxtLink>
    <GroupMenuItem
      v-for="child in group.children || []"
      :key="child.id"
      :group="child"
      :depth="depth + 1"
    />
  </div>
</template>

<script setup lang="ts">
import type { Group } from '~/types';

const props = defineProps<{
  group: Group;
  depth: number;
}>();

const route = useRoute();
const isActive = computed(
  () => route.path === '/' && route.query.groupId === props.group.id,
);
</script>
