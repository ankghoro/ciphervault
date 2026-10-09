<template>
  <AppModal :model-value="modelValue" :title="title" size="sm" @update:model-value="$emit('update:modelValue', $event)">
    <p class="text-sm text-slate-600">{{ message }}</p>
    <template #footer>
      <AppButton variant="secondary" @click="$emit('update:modelValue', false)">Cancel</AppButton>
      <AppButton :variant="danger ? 'danger' : 'primary'" :loading="loading" @click="$emit('confirm')">
        {{ confirmLabel }}
      </AppButton>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    danger?: boolean;
    loading?: boolean;
  }>(),
  { confirmLabel: 'Confirm', danger: false, loading: false },
);

defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'confirm'): void;
}>();
</script>
