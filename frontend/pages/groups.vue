<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-lg font-semibold text-slate-900">Groups</h1>
        <p class="text-sm text-slate-500">Hierarchical folders — they appear as menu items automatically</p>
      </div>
      <AppButton @click="openCreate">Add group</AppButton>
    </div>

    <AppTable
      :columns="columns"
      :data="groups"
      :loading="loading"
      empty-message="No groups yet"
    >
      <template #name="{ item }">
        <span class="font-medium text-slate-800">{{ item.name }}</span>
        <span v-if="item.parentId" class="ml-2 text-xs text-slate-400">
          (sub of {{ parentName(item.parentId) }})
        </span>
      </template>
      <template #count="{ item }">
        {{ item._count?.credentials ?? 0 }}
      </template>
      <template #actions="{ item }">
        <div class="flex justify-end gap-1">
          <button class="text-xs text-slate-600 hover:underline px-1.5" @click="openEdit(item)">Edit</button>
          <button class="text-xs text-rose-600 hover:underline px-1.5" @click="askDelete(item)">Delete</button>
        </div>
      </template>
      <template #emptyAction>
        <AppButton size="sm" @click="openCreate">Create group</AppButton>
      </template>
    </AppTable>

    <AppModal v-model="formOpen" :title="editing ? 'Edit group' : 'New group'">
      <form class="space-y-4" @submit.prevent="save">
        <AppInput v-model="form.name" label="Name" required />
        <AppInput v-model="form.description" label="Description" />
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-slate-700">Parent group</label>
          <select v-model="form.parentId" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">None (top level)</option>
            <option
              v-for="g in groups.filter((x) => x.id !== editing?.id)"
              :key="g.id"
              :value="g.id"
            >
              {{ g.name }}
            </option>
          </select>
        </div>
        <p v-if="formError" class="text-sm text-rose-600">{{ formError }}</p>
      </form>
      <template #footer>
        <AppButton variant="secondary" @click="formOpen = false">Cancel</AppButton>
        <AppButton :loading="saving" @click="save">{{ editing ? 'Save' : 'Create' }}</AppButton>
      </template>
    </AppModal>

    <ConfirmDialog
      v-model="deleteOpen"
      title="Delete group"
      message="Group will be moved to trash (soft delete)."
      confirm-label="Delete"
      danger
      :loading="deleting"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Group } from '~/types';

definePageMeta({ middleware: 'auth' });

const { api } = useApi();
const refreshSidebar = inject<() => Promise<void>>('refreshSidebar', async () => {});

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'description', header: 'Description' },
  { key: 'count', header: 'Credentials' },
  { key: 'actions', header: '', align: 'right' as const },
];

const groups = ref<Group[]>([]);
const loading = ref(false);
const formOpen = ref(false);
const editing = ref<Group | null>(null);
const saving = ref(false);
const formError = ref('');
const form = reactive({ name: '', description: '', parentId: '' });
const deleteOpen = ref(false);
const toDelete = ref<Group | null>(null);
const deleting = ref(false);

function parentName(id: string) {
  return groups.value.find((g) => g.id === id)?.name || id;
}

async function fetchList() {
  loading.value = true;
  try {
    groups.value = await api<Group[]>('/groups');
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = null;
  Object.assign(form, { name: '', description: '', parentId: '' });
  formError.value = '';
  formOpen.value = true;
}

function openEdit(item: Group) {
  editing.value = item;
  Object.assign(form, {
    name: item.name,
    description: item.description || '',
    parentId: item.parentId || '',
  });
  formError.value = '';
  formOpen.value = true;
}

async function save() {
  saving.value = true;
  formError.value = '';
  try {
    const body = {
      name: form.name,
      description: form.description || undefined,
      parentId: form.parentId || null,
    };
    if (editing.value) {
      await api(`/groups/${editing.value.id}`, { method: 'PATCH', body });
    } else {
      await api('/groups', { method: 'POST', body });
    }
    formOpen.value = false;
    await fetchList();
    await refreshSidebar();
  } catch (e: any) {
    formError.value = e.message;
  } finally {
    saving.value = false;
  }
}

function askDelete(item: Group) {
  toDelete.value = item;
  deleteOpen.value = true;
}

async function doDelete() {
  if (!toDelete.value) return;
  deleting.value = true;
  try {
    await api(`/groups/${toDelete.value.id}`, { method: 'DELETE' });
    deleteOpen.value = false;
    await fetchList();
    await refreshSidebar();
  } finally {
    deleting.value = false;
  }
}

onMounted(fetchList);
</script>
