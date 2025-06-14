<script setup lang="tsx">
import { NTag } from 'naive-ui';
import { computed } from 'vue';
import { $t } from '@/locales';

const props = defineProps<{ labels: Record<string, string> }>();
const labelsVar = props.labels;

const getType = (key: string, value: string) => {
  // 默认的一些标签加特殊颜色
  if (key === 'env' && value === 'prod') return 'error';
  if (key === 'env' && value === 'dev') return 'info';
  if (key === 'name') return 'success';
  return 'info';
};

const filteredEntries = computed(() => Object.entries(labelsVar).filter(([key]) => key !== 'state'));
</script>

<template>
  <div>
    <template v-if="filteredEntries.length > 0">
      <NTag
        strong
        class="mb-4px mr-6px"
        :type="getType(filteredEntries[0][0], filteredEntries[0][1])"
        :title="`${filteredEntries[0][0]}:${filteredEntries[0][1]}`"
      >
        {{ filteredEntries[0][0] }}:{{ filteredEntries[0][1] }}
      </NTag>
      <NPopover v-if="filteredEntries.length > 1">
        <template #trigger>
          <NTag class="mb-4px mr-6px" type="default">+{{ filteredEntries.length - 1 }}</NTag>
        </template>
        <div style="max-width: 220px; word-break: break-all">
          <template v-for="([key, value], idx) in filteredEntries" :key="key">
            <NTag v-if="idx > 0" class="mb-4px mr-6px" :type="getType(key, value)">{{ key }}:{{ value }}</NTag>
          </template>
        </div>
      </NPopover>
    </template>
    <NTag v-else class="mb-4px mr-6px" type="info">{{ $t('common.none') }}</NTag>
  </div>
</template>
