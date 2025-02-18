<script setup lang="ts">
import { $t } from '@/locales';
import { tagColor } from '@/utils/common';
import { retryStatusTypeRecord, retryTaskTypeRecord } from '@/constants/business';

defineOptions({
  name: 'RetryDetailDrawer'
});

interface Props {
  /** row data */
  rowData?: Api.Retry.Retry | null;
}

defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});
</script>

<template>
  <OperateDrawer v-model="visible" :title="$t('page.retryTask.detail')">
    <NDescriptions label-placement="top" bordered :column="2">
      <NDescriptionsItem :label="$t('page.retryTask.groupName')" :span="2">
        {{ rowData?.groupName }}
      </NDescriptionsItem>
      <NDescriptionsItem :label="$t('page.retryTask.sceneName')" :span="2">
        {{ rowData?.sceneName }}
      </NDescriptionsItem>
      <NDescriptionsItem :label="$t('page.retryTask.nextTriggerAt')" :span="1">
        {{ rowData?.nextTriggerAt }}
      </NDescriptionsItem>
      <NDescriptionsItem :label="$t('page.retryTask.retryCount')" :span="1">
        {{ rowData?.retryCount }}
      </NDescriptionsItem>
      <NDescriptionsItem :label="$t('page.retryTask.retryStatus')" :span="1">
        <NTag :type="tagColor(rowData?.retryStatus!)">
          {{ $t(retryStatusTypeRecord[rowData?.retryStatus!]) }}
        </NTag>
      </NDescriptionsItem>
      <NDescriptionsItem :label="$t('page.retryTask.taskType')" :span="1">
        <NTag :type="tagColor(rowData?.taskType!)">{{ $t(retryTaskTypeRecord[rowData?.taskType!]) }}</NTag>
      </NDescriptionsItem>
      <NDescriptionsItem :label="$t('page.retryTask.bizNo')" :span="2">{{ rowData?.bizNo }}</NDescriptionsItem>
      <NDescriptionsItem :label="$t('page.retryTask.idempotentId')" :span="2">
        {{ rowData?.idempotentId }}
      </NDescriptionsItem>
      <NDescriptionsItem :label="$t('page.retryTask.executorName')" :span="2">
        {{ rowData?.executorName }}
      </NDescriptionsItem>
      <NDescriptionsItem :label="$t('page.retryTask.argsStr')" :span="2">{{ rowData?.argsStr }}</NDescriptionsItem>
      <NDescriptionsItem :label="$t('common.createDt')" :span="1">{{ rowData?.createDt }}</NDescriptionsItem>
      <NDescriptionsItem :label="$t('common.updateDt')" :span="1">{{ rowData?.updateDt }}</NDescriptionsItem>
    </NDescriptions>
  </OperateDrawer>
</template>

<style scoped>
:deep(.virtual-list) {
  height: calc(100vh - 166px) !important;
  max-height: calc(100vh - 166px) !important;
}
</style>
