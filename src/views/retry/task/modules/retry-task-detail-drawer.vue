<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { $t } from '@/locales';
import { tagColor } from '@/utils/common';
import { retryStatusTypeRecord, retryTaskTypeRecord } from '@/constants/business';
import { fetchRetryLogList } from '@/service/api/log';

defineOptions({
  name: 'SceneDetailDrawer'
});

interface Props {
  /** row data */
  rowData?: Api.Retry.Retry | null;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const logList = ref<Api.JobLog.JobMessage[]>([]);
const interval = ref<NodeJS.Timeout>();
const controller = new AbortController();
const finished = ref<boolean>(false);
let startId = '0';
let fromIndex: number = 0;

async function getLogList() {
  const { data: logData, error } = await fetchRetryLogList({
    groupName: props.rowData!.groupName,
    retryTaskId: props.rowData!.id! as any,
    startId,
    fromIndex,
    size: 50
  });
  if (!error) {
    finished.value = logData.finished;
    startId = logData.nextStartId;
    fromIndex = logData.fromIndex;
    if (logData.message) {
      logList.value.push(...logData.message);
      logList.value.sort((a, b) => Number.parseInt(a.time_stamp, 10) - Number.parseInt(b.time_stamp, 10));
    }
    if (!finished.value) {
      clearTimeout(interval.value);
      interval.value = setTimeout(getLogList, 1000);
    }
  }
}

const handleUpdateTab = async (value: number) => {
  if (value === 1 && logList.value.length === 0) {
    await getLogList();
  }
};

const stopLog = () => {
  finished.value = true;
  controller.abort();
  clearTimeout(interval.value);
  interval.value = undefined;
};

onBeforeUnmount(() => {
  stopLog();
});
</script>

<template>
  <OperateDrawer v-model="visible" :title="$t('page.retryTask.detail')">
    <NTabs type="segment" animated @update:value="handleUpdateTab">
      <NTabPane :name="0" :tab="$t('page.log.info')">
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
      </NTabPane>
    </NTabs>
  </OperateDrawer>
</template>

<style scoped>
:deep(.virtual-list) {
  height: calc(100vh - 166px) !important;
  max-height: calc(100vh - 166px) !important;
}
</style>
