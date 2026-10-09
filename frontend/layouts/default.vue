<template>
  <div class="flex h-screen overflow-hidden bg-slate-50">
    <!-- Sidebar -->
    <aside class="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col">
      <div class="h-14 flex items-center gap-2.5 px-4 border-b border-slate-100">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <span class="font-semibold text-slate-900 text-sm">CipherVault</span>
      </div>

      <nav class="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        <NuxtLink
          to="/"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="isActive('/') && !route.query.groupId ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Credentials
        </NuxtLink>

        <!-- Groups tree as menu/submenu -->
        <div class="pt-2">
          <p class="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Groups</p>
          <template v-if="groupsTree.length">
            <GroupMenuItem
              v-for="g in groupsTree"
              :key="g.id"
              :group="g"
              :depth="0"
            />
          </template>
          <p v-else class="px-3 py-2 text-xs text-slate-400">No groups yet</p>
        </div>

        <div class="pt-2 space-y-0.5">
          <p class="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Manage</p>
          <NuxtLink
            to="/groups"
            class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="isActive('/groups') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Groups
          </NuxtLink>
          <NuxtLink
            to="/categories"
            class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="isActive('/categories') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Categories
          </NuxtLink>
          <NuxtLink
            to="/trash"
            class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="isActive('/trash') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Trash
            <span
              v-if="metrics?.trashCount"
              class="ml-auto text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-semibold"
            >
              {{ metrics.trashCount }}
            </span>
          </NuxtLink>
        </div>
      </nav>

      <div class="border-t border-slate-100 p-3">
        <div class="flex items-center gap-2.5 px-2">
          <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
            {{ userInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-800 truncate">{{ user?.name }}</p>
            <p class="text-xs text-slate-400 truncate">{{ user?.email }}</p>
          </div>
          <button
            type="button"
            class="text-slate-400 hover:text-slate-600 p-1"
            title="Logout"
            @click="logout"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header class="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0">
        <div class="text-sm text-slate-500">
          <span class="font-medium text-slate-800">Vault</span>
          <span class="mx-1.5 text-slate-300">/</span>
          <span>{{ pageTitle }}</span>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          AES-256-GCM
        </div>
      </header>
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Group, Metrics } from '~/types';

const route = useRoute();
const { user, logout } = useAuth();
const { api } = useApi();

const groupsTree = useState<Group[]>('groups_tree', () => []);
const metrics = useState<Metrics | null>('metrics', () => null);

const userInitials = computed(() => {
  if (!user.value?.name) return '?';
  return user.value.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
});

const pageTitle = computed(() => {
  if (route.path === '/') return route.query.groupId ? 'Group credentials' : 'Credentials';
  if (route.path === '/groups') return 'Groups';
  if (route.path === '/categories') return 'Categories';
  if (route.path === '/trash') return 'Trash';
  return '';
});

function isActive(path: string) {
  return route.path === path;
}

async function loadSidebar() {
  try {
    const [tree, m] = await Promise.all([
      api<Group[]>('/groups', { query: { tree: 'true' } }),
      api<Metrics>('/credentials/metrics'),
    ]);
    groupsTree.value = tree;
    metrics.value = m;
  } catch {
    // ignore on public pages
  }
}

provide('refreshSidebar', loadSidebar);

onMounted(loadSidebar);

// Refresh when route changes
watch(() => route.path, () => loadSidebar());
</script>
