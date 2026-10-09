<template>
  <div class="w-full border border-slate-200 rounded-xl overflow-hidden bg-white">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3 whitespace-nowrap"
              :class="col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'"
            >
              {{ col.header }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="loading">
            <td :colspan="columns.length" class="px-6 py-12 text-center text-slate-400">
              Loading...
            </td>
          </tr>
          <tr v-else-if="!data.length">
            <td :colspan="columns.length" class="px-6 py-12 text-center text-slate-500">
              <p class="text-sm font-medium text-slate-700">{{ emptyMessage }}</p>
              <div v-if="$slots.emptyAction" class="mt-3">
                <slot name="emptyAction" />
              </div>
            </td>
          </tr>
          <tr
            v-for="(item, idx) in data"
            v-else
            :key="item.id || idx"
            class="hover:bg-slate-50 transition-colors"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3"
              :class="col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'"
            >
              <slot :name="col.key" :item="item">
                {{ item[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      v-if="pagination && pagination.totalPages > 1"
      class="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50 text-sm"
    >
      <span class="text-slate-500">
        {{ pagination.total }} total · page {{ pagination.page }} of {{ pagination.totalPages }}
      </span>
      <div class="flex gap-2">
        <AppButton
          size="sm"
          variant="secondary"
          :disabled="!pagination.hasPrevPage"
          @click="$emit('page', pagination.page - 1)"
        >
          Prev
        </AppButton>
        <AppButton
          size="sm"
          variant="secondary"
          :disabled="!pagination.hasNextPage"
          @click="$emit('page', pagination.page + 1)"
        >
          Next
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Pagination } from '~/types';

defineProps<{
  columns: { key: string; header: string; align?: 'left' | 'center' | 'right' }[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: Pagination | null;
}>();

defineEmits<{ (e: 'page', page: number): void }>();
</script>
