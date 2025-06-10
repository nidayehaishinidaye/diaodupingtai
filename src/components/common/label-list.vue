<script setup lang="tsx">
import { NTag, NTooltip } from 'naive-ui';
import { $t } from '@/locales';

defineProps<{ labels: Record<string, string> }>();

const getType = (key: string, value: string) => {
  // 默认的一些标签加特殊颜色
  if (key === 'env' && value === 'prod') return 'error';
  if (key === 'env' && value === 'dev') return 'info';
  if (key === 'name') return 'success';
  return 'info';
};
</script>

<template>
  <div>
    <template v-if="Object.keys(labels).length > 0">
      <NTag
        strong
        class="mb-4px mr-6px"
        :type="getType(Object.keys(labels)[0], Object.values(labels)[0])"
        :title="`${Object.keys(labels)[0]}:${Object.values(labels)[0]}`"
      >
        {{ Object.keys(labels)[0] }}:{{ Object.values(labels)[0] }}
      </NTag>
      <NTooltip v-if="Object.keys(labels).length > 1">
        <template #trigger>
          <NTag class="mb-4px mr-6px" type="default">+{{ Object.keys(labels).length - 1 }}</NTag>
        </template>
        <div style="max-width: 220px; word-break: break-all">
          <template v-for="(value, key) in Object.entries(labels)" :key="key">
            <NTag
              v-if="key > 0"
              class="mb-4px mr-6px"
              :type="getType(Object.keys(labels)[key], Object.values(labels)[key])"
            >
              {{ Object.keys(labels)[key] }}:{{ Object.values(labels)[key] }}
            </NTag>
          </template>
        </div>
      </NTooltip>
    </template>
    <NTag v-else class="mb-4px mr-6px" type="info">{{ $t('common.none') }}</NTag>
  </div>
</template>
