<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-lg font-semibold text-slate-900">Categories</h1>
        <p class="text-sm text-slate-500">Classify credentials by type</p>
      </div>
      <AppButton @click="openCreate">Add category</AppButton>
    </div>

    <AppTable
      :columns="columns"
      :data="categories"
      :loading="loading"
      empty-message="No categories yet"
    >
      <template #name="{ item }">
        <AppBadge :color-hex="item.color" dot>{{ item.name }}</AppBadge>
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
        <AppButton size="sm" @click="openCreate">Create category</AppButton>
      </template>
    </AppTable>

    <AppModal v-model="formOpen" :title="editing ? 'Edit category' : 'New category'">
      <form class="space-y-4" @submit.prevent="save">
        <AppInput v-model="form.name" label="Name" required />
        <AppInput v-model="form.description" label="Description" />
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-slate-700">Color</label>
          <div class="flex items-center gap-2">
            <input v-model="form.color" type="color" class="w-10 h-10 rounded border border-slate-200 cursor-pointer" />
            <AppInput v-model="form.color" class="flex-1" />
          </div>
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
      title="Delete category"
      message="Category will be deleted?"
      confirm-label="Delete"
      danger
      :loading="deleting"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/types';

definePageMeta({ middleware: 'auth' });

const { api } = useApi();

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'description', header: 'Description' },
  { key: 'count', header: 'Credentials' },
  { key: 'actions', header: '', align: 'right' as const },
];

const categories = ref<Category[]>([]);
const loading = ref(false);
const formOpen = ref(false);
const editing = ref<Category | null>(null);
const saving = ref(false);
const formError = ref('');
const form = reactive({ name: '', description: '', color: '#6366f1' });
const deleteOpen = ref(false);
const toDelete = ref<Category | null>(null);
const deleting = ref(false);

async function fetchList() {
  loading.value = true;
  try {
    categories.value = await api<Category[]>('/categories');
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = null;
  Object.assign(form, { name: '', description: '', color: '#6366f1' });
  formError.value = '';
  formOpen.value = true;
}

function openEdit(item: Category) {
  editing.value = item;
  Object.assign(form, {
    name: item.name,
    description: item.description || '',
    color: item.color || '#6366f1',
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
      color: form.color,
    };
    if (editing.value) {
      await api(`/categories/${editing.value.id}`, { method: 'PATCH', body });
    } else {
      await api('/categories', { method: 'POST', body });
    }
    formOpen.value = false;
    await fetchList();
  } catch (e: any) {
    formError.value = e.message;
  } finally {
    saving.value = false;
  }
}

function askDelete(item: Category) {
  toDelete.value = item;
  deleteOpen.value = true;
}

async function doDelete() {
  if (!toDelete.value) return;
  deleting.value = true;
  try {
    await api(`/categories/${toDelete.value.id}`, { method: 'DELETE' });
    deleteOpen.value = false;
    await fetchList();
  } finally {
    deleting.value = false;
  }
}

onMounted(fetchList);
</script>
