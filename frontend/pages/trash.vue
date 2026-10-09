<template>
  <div>
    <div class="mb-5">
      <h1 class="text-lg font-semibold text-slate-900">Trash</h1>
      <p class="text-sm text-slate-500">Soft-deleted credentials — restore or permanently remove</p>
    </div>

    <AppTable
      :columns="columns"
      :data="items"
      :loading="loading"
      empty-message="Trash is empty"
    >
      <template #title="{ item }">
        <span class="font-medium text-slate-800">{{ item.title }}</span>
      </template>
      <template #deletedAt="{ item }">
        {{ formatDate(item.deletedAt) }}
      </template>
      <template #actions="{ item }">
        <div class="flex justify-end gap-1">
          <button class="text-xs text-indigo-600 hover:underline px-1.5" @click="restore(item)">Restore</button>
          <button class="text-xs text-rose-600 hover:underline px-1.5" @click="askPurge(item)">Delete forever</button>
        </div>
      </template>
    </AppTable>

    <ConfirmDialog
      v-model="purgeOpen"
      title="Permanently delete"
      message="This cannot be undone. The credential will be removed forever. Continue this action?"
      confirm-label="Delete forever"
      danger
      :loading="purging"
      @confirm="doPurge"
    />
  </div>
</template>

<script setup lang="ts">
import type { Credential, PaginatedResult } from '~/types';

definePageMeta({ middleware: 'auth' });

const { api } = useApi();
const refreshSidebar = inject<() => Promise<void>>('refreshSidebar', async () => {});

const columns = [
  { key: 'title', header: 'Title' },
  { key: 'username', header: 'Username' },
  { key: 'deletedAt', header: 'Deleted at' },
  { key: 'actions', header: '', align: 'right' as const },
];

const items = ref<Credential[]>([]);
const loading = ref(false);
const purgeOpen = ref(false);
const toPurge = ref<Credential | null>(null);
const purging = ref(false);

function formatDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString();
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await api<PaginatedResult<Credential>>('/credentials', {
      query: { isDeleted: 'true', limit: 50 },
    });
    items.value = res.data;
  } finally {
    loading.value = false;
  }
}

async function restore(item: Credential) {
  await api(`/credentials/${item.id}/restore`, { method: 'POST' });
  await fetchList();
  await refreshSidebar();
}

function askPurge(item: Credential) {
  toPurge.value = item;
  purgeOpen.value = true;
}

async function doPurge() {
  if (!toPurge.value) return;
  purging.value = true;
  try {
    await api(`/credentials/${toPurge.value.id}/purge`, { method: 'DELETE' });
    purgeOpen.value = false;
    await fetchList();
    await refreshSidebar();
  } finally {
    purging.value = false;
  }
}

onMounted(fetchList);
</script>
