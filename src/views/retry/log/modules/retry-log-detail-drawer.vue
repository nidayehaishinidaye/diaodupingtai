<script setup lang="ts">
import { $t } from '@/locales';
import { tagColor } from '@/utils/common';
import { retryTaskStatusTypeRecord, retryTaskTypeRecord } from '@/constants/business';

defineOptions({
  name: 'SceneDetailDrawer'
});

interface Props {
  /** row data */
  rowData?: Api.RetryTask.RetryTask | null;
}

defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});
</script>

<template>
  <DetailDrawer v-model="visible" :title="$t('page.retryLog.detail')" :width="['50%', '90%']">
    <NTabs type="segment" animated>
      <NTabPane :name="0" :tab="$t('page.log.info')">
        <NDescriptions label-placement="top" bordered :column="2">
          <NDescriptionsItem :label="$t('page.retryLog.groupName')" :span="2">
            {{ rowData?.groupName }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.retryLog.sceneName')" :span="2">
            {{ rowData?.sceneName }}
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.retryLog.retryStatus')" :span="1">
            <NTag :type="tagColor(rowData?.taskStatus!)">
              {{ $t(retryTaskStatusTypeRecord[rowData?.taskStatus!]) }}
            </NTag>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('page.retryLog.taskType')" :span="1">
            <NTag :type="tagColor(rowData?.taskType!)">{{ $t(retryTaskTypeRecord[rowData?.taskType!]) }}</NTag>
          </NDescriptionsItem>
          <NDescriptionsItem :label="$t('common.createDt')">{{ rowData?.createDt }}</NDescriptionsItem>
        </NDescriptions>
      </NTabPane>
      <NTabPane :name="1" :tab="$t('page.log.title')" display-directive="if">
        <LogDrawer :drawer="false" type="retry" :task-data="rowData!" />
      </NTabPane>
    </NTabs>
  </DetailDrawer>
</template>

<style scoped>
:deep(.virtual-list) {
  height: calc(100vh - 166px) !important;
  max-height: calc(100vh - 166px) !important;
}
</style>
