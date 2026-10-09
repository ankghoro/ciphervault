<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h1 class="text-lg font-semibold text-slate-900">Credentials</h1>
        <p class="text-sm text-slate-500">
          {{ result?.pagination.total ?? 0 }} entries
          <span v-if="groupId">in selected group</span>
        </p>
      </div>
      <AppButton @click="openCreate">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add credential
      </AppButton>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-4">
      <div class="flex-1 min-w-[200px]">
        <input
          v-model="search"
          type="search"
          placeholder="Search title, username, URL..."
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          @input="debouncedFetch"
        />
      </div>
      <select
        v-model="categoryId"
        class="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:border-indigo-500 focus:outline-none"
        @change="page = 1; fetchList()"
      >
        <option value="all">All categories</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>

    <AppTable
      :columns="columns"
      :data="result?.data || []"
      :loading="loading"
      :pagination="result?.pagination"
      empty-message="No credentials found"
      @page="(p) => { page = p; fetchList(); }"
    >
      <template #title="{ item }">
        <button class="text-left font-medium text-slate-800 hover:text-indigo-600" @click="openDetail(item)">
          {{ item.title }}
        </button>
      </template>
      <template #username="{ item }">
        <span class="text-slate-600">{{ item.username || '—' }}</span>
      </template>
      <template #category="{ item }">
        <AppBadge v-if="item.category" :color-hex="item.category.color" dot>
          {{ item.category.name }}
        </AppBadge>
        <span v-else class="text-slate-400">—</span>
      </template>
      <template #group="{ item }">
        <span class="text-slate-600">{{ item.group?.name || '—' }}</span>
      </template>
      <template #actions="{ item }">
        <div class="flex items-center justify-end gap-1">
          <button class="text-xs text-indigo-600 hover:underline px-1.5 py-1" @click="openDetail(item)">View</button>
          <button class="text-xs text-slate-600 hover:underline px-1.5 py-1" @click="openEdit(item)">Edit</button>
          <button class="text-xs text-rose-600 hover:underline px-1.5 py-1" @click="askDelete(item)">Delete</button>
        </div>
      </template>
      <template #emptyAction>
        <AppButton size="sm" @click="openCreate">Add first credential</AppButton>
      </template>
    </AppTable>

    <!-- Create / Edit modal -->
    <AppModal v-model="formOpen" :title="editing ? 'Edit credential' : 'New credential'" size="lg">
      <form class="space-y-4" @submit.prevent="save">
        <AppInput v-model="form.title" label="Title" required />
        <AppInput v-model="form.username" label="Username / email" />
        <AppInput
          v-model="form.password"
          label="Password"
          show-password-toggle
          :required="!editing"
          :helper-text="editing ? 'Leave blank to keep current password' : ''"
        />
        <AppInput v-model="form.url" label="URL" placeholder="https://" />
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-slate-700">Category</label>
            <select v-model="form.categoryId" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="">None</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-slate-700">Group</label>
            <select v-model="form.groupId" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="">None</option>
              <option v-for="g in flatGroups" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
          </div>
        </div>
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-slate-700">Notes</label>
          <textarea
            v-model="form.notes"
            rows="3"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <p v-if="formError" class="text-sm text-rose-600">{{ formError }}</p>
      </form>
      <template #footer>
        <AppButton variant="secondary" @click="formOpen = false">Cancel</AppButton>
        <AppButton :loading="saving" @click="save">{{ editing ? 'Save changes' : 'Create' }}</AppButton>
      </template>
    </AppModal>

    <!-- Detail / reveal modal -->
    <AppModal v-model="detailOpen" title="Credential detail" size="md">
      <div v-if="selected" class="space-y-3 text-sm">
        <div>
          <p class="text-xs text-slate-400">Title</p>
          <p class="font-medium text-slate-900">{{ selected.title }}</p>
        </div>
        <div>
          <p class="text-xs text-slate-400">Username</p>
          <p class="text-slate-800">{{ selected.username || '—' }}</p>
        </div>
        <div>
          <p class="text-xs text-slate-400">Password</p>
          <div class="flex items-center gap-2 mt-0.5">
            <code class="bg-slate-100 px-2 py-1 rounded text-sm font-mono">
              {{ revealed || '••••••••' }}
            </code>
            <AppButton size="sm" variant="secondary" :loading="revealing" @click="reveal">
              {{ revealed ? 'Hide' : 'Reveal' }}
            </AppButton>
            <AppButton v-if="revealed" size="sm" variant="ghost" @click="copyPassword">Copy</AppButton>
          </div>
        </div>
        <div v-if="selected.url">
          <p class="text-xs text-slate-400">URL</p>
          <a :href="selected.url" target="_blank" class="text-indigo-600 hover:underline break-all">{{ selected.url }}</a>
        </div>
        <div v-if="selected.notes">
          <p class="text-xs text-slate-400">Notes</p>
          <p class="text-slate-700 whitespace-pre-wrap">{{ selected.notes }}</p>
        </div>
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="detailOpen = false">Close</AppButton>
        <AppButton variant="secondary" @click="openEdit(selected!)">Edit</AppButton>
      </template>
    </AppModal>

    <ConfirmDialog
      v-model="deleteOpen"
      title="Move to trash"
      message="This credential will be delete to Trash and can be restored. Continue this action?"
      confirm-label="Move to trash"
      danger
      :loading="deleting"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Category, Credential, Group, PaginatedResult } from '~/types';

definePageMeta({ middleware: 'auth' });

const { api } = useApi();
const route = useRoute();
const refreshSidebar = inject<() => Promise<void>>('refreshSidebar', async () => {});

const columns = [
  { key: 'title', header: 'Title' },
  { key: 'username', header: 'Username' },
  { key: 'category', header: 'Category' },
  { key: 'group', header: 'Group' },
  { key: 'actions', header: '', align: 'right' as const },
];

const result = ref<PaginatedResult<Credential> | null>(null);
const categories = ref<Category[]>([]);
const flatGroups = ref<Group[]>([]);
const loading = ref(false);
const search = ref('');
const categoryId = ref('all');
const page = ref(1);
const groupId = computed(() => (route.query.groupId as string) || undefined);

const formOpen = ref(false);
const editing = ref<Credential | null>(null);
const saving = ref(false);
const formError = ref('');
const form = reactive({
  title: '',
  username: '',
  password: '',
  url: '',
  notes: '',
  categoryId: '',
  groupId: '',
});

const detailOpen = ref(false);
const selected = ref<Credential | null>(null);
const revealed = ref('');
const revealing = ref(false);

const deleteOpen = ref(false);
const toDelete = ref<Credential | null>(null);
const deleting = ref(false);

let debounceTimer: ReturnType<typeof setTimeout>;
function debouncedFetch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    page.value = 1;
    fetchList();
  }, 300);
}

async function fetchList() {
  loading.value = true;
  try {
    result.value = await api<PaginatedResult<Credential>>('/credentials', {
      query: {
        search: search.value || undefined,
        categoryId: categoryId.value !== 'all' ? categoryId.value : undefined,
        groupId: groupId.value,
        page: page.value,
        limit: 10,
      },
    });
  } catch {
    result.value = null;
  } finally {
    loading.value = false;
  }
}

async function loadMeta() {
  try {
    const [cats, groups] = await Promise.all([
      api<Category[]>('/categories'),
      api<Group[]>('/groups'),
    ]);
    categories.value = cats;
    flatGroups.value = groups;
  } catch {
    // ignore
  }
}

function openCreate() {
  editing.value = null;
  Object.assign(form, {
    title: '',
    username: '',
    password: '',
    url: '',
    notes: '',
    categoryId: '',
    groupId: groupId.value || '',
  });
  formError.value = '';
  formOpen.value = true;
}

function openEdit(item: Credential) {
  editing.value = item;
  Object.assign(form, {
    title: item.title,
    username: item.username || '',
    password: '',
    url: item.url || '',
    notes: item.notes || '',
    categoryId: item.categoryId || '',
    groupId: item.groupId || '',
  });
  formError.value = '';
  detailOpen.value = false;
  formOpen.value = true;
}

function openDetail(item: Credential) {
  selected.value = item;
  revealed.value = '';
  detailOpen.value = true;
}

async function reveal() {
  if (revealed.value) {
    revealed.value = '';
    return;
  }
  if (!selected.value) return;
  revealing.value = true;
  try {
    const res = await api<{ password: string }>(`/credentials/${selected.value.id}/reveal`);
    revealed.value = res.password;
  } catch (e: any) {
    formError.value = e.message;
  } finally {
    revealing.value = false;
  }
}

function copyPassword() {
  if (revealed.value) navigator.clipboard.writeText(revealed.value);
}

async function save() {
  saving.value = true;
  formError.value = '';
  try {
    const body: Record<string, unknown> = {
      title: form.title,
      username: form.username || undefined,
      url: form.url || undefined,
      notes: form.notes || undefined,
      categoryId: form.categoryId || null,
      groupId: form.groupId || null,
    };
    if (form.password) body.password = form.password;

    if (editing.value) {
      if (!form.password) delete body.password;
      await api(`/credentials/${editing.value.id}`, { method: 'PATCH', body });
    } else {
      if (!form.password) {
        formError.value = 'Password is required';
        saving.value = false;
        return;
      }
      await api('/credentials', { method: 'POST', body });
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

function askDelete(item: Credential) {
  toDelete.value = item;
  deleteOpen.value = true;
}

async function doDelete() {
  if (!toDelete.value) return;
  deleting.value = true;
  try {
    await api(`/credentials/${toDelete.value.id}`, { method: 'DELETE' });
    deleteOpen.value = false;
    await fetchList();
    await refreshSidebar();
  } catch {
    // ignore
  } finally {
    deleting.value = false;
  }
}

watch(groupId, () => {
  page.value = 1;
  fetchList();
});

onMounted(async () => {
  await Promise.all([loadMeta(), fetchList()]);
});
</script>
