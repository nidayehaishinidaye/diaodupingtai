<script setup lang="tsx">
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { ref } from 'vue';
import { useBoolean } from '@sa/hooks';
import { fetchBatchDeleteRetryLog, fetchDeleteRetryLog, fetchRetryLogById, fetchRetryLogPageList } from '@/service/api';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { retryTaskStatusTypeRecord, retryTaskTypeRecord } from '@/constants/business';
import { monthRangeISO8601, tagColor } from '@/utils/common';
import RetryLogSearch from './modules/retry-log-search.vue';
import RetryLogDetailDrawer from './modules/retry-log-detail-drawer.vue';

const appStore = useAppStore();

/** 详情页属性数据 */
const detailData = ref<Api.RetryLog.RetryLog | null>();
/** 详情页可见状态 */
const { bool: detailVisible, setTrue: openDetail } = useBoolean(false);
const taskStatus = history.state.taskStatus;

const { columns, columnChecks, data, getData, loading, mobilePagination, searchParams, resetSearchParams } = useTable({
  apiFn: fetchRetryLogPageList,
  apiParams: {
    page: 1,
    size: 10,
    // if you want to use the searchParams in Form, you need to define the following properties, and the value is null
    // the value can not be undefined, otherwise the property in Form will not be reactive
    groupName: null,
    sceneName: null,
    taskStatus: null,
    datetimeRange: monthRangeISO8601()
  },
  searchParams: {
    taskStatus
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48,
      disabled: row => row.taskStatus === 1
    },
    {
      key: 'id',
      title: $t('common.index'),
      align: 'center',
      width: 64,
      render: row => {
        async function showDetailDrawer() {
          await loadRetryInfo(row);
          openDetail();
        }

        return (
          <n-button text tag="a" type="primary" onClick={showDetailDrawer} class="ws-normal">
            {row.id}
          </n-button>
        );
      }
    },
    {
      key: 'groupName',
      title: $t('page.retryLog.groupName'),
      align: 'left',
      minWidth: 120
    },
    {
      key: 'sceneName',
      title: $t('page.retryLog.sceneName'),
      align: 'left',
      minWidth: 120
    },
    {
      key: 'taskStatus',
      title: $t('page.retryLog.retryStatus'),
      align: 'left',
      minWidth: 120,
      render: row => {
        if (row.taskStatus === null) {
          return null;
        }
        const tagMap: Record<number, NaiveUI.ThemeColor> = {
          1: 'info',
          2: 'info',
          3: 'info',
          4: 'error',
          5: 'error',
          6: 'error'
        };

        const label = $t(retryTaskStatusTypeRecord[row.taskStatus!]);

        return <NTag type={tagMap[row.taskStatus!]}>{label}</NTag>;
      }
    },
    {
      key: 'taskType',
      title: $t('page.retryLog.taskType'),
      align: 'left',
      minWidth: 120,
      render: row => {
        if (row.taskType === null) {
          return null;
        }
        const label = $t(retryTaskTypeRecord[row.taskType!]);

        return <NTag type={tagColor(row.taskType!)}>{label}</NTag>;
      }
    },
    {
      key: 'createDt',
      title: $t('page.retryLog.createDt'),
      align: 'left',
      minWidth: 120
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 80,
      render: row => (
        <div class="flex-center gap-8px">
          {row.taskStatus === 1 || row.taskStatus === 2 ? (
            <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
              {{
                default: () => $t('common.confirmDelete'),
                trigger: () => (
                  <NButton type="error" text ghost size="small">
                    {$t('common.delete')}
                  </NButton>
                )
              }}
            </NPopconfirm>
          ) : (
            ''
          )}
        </div>
      )
    }
  ]
});

const { checkedRowKeys, onDeleted, onBatchDeleted } = useTableOperate(data, getData);

async function handleBatchDelete() {
  const { error } = await fetchBatchDeleteRetryLog(checkedRowKeys.value as any[]);
  if (error) return;
  onBatchDeleted();
}

async function handleDelete(id: any) {
  const { error } = await fetchDeleteRetryLog(id);
  if (error) return;
  onDeleted();
}

async function loadRetryInfo(row: Api.RetryLog.RetryLog) {
  const res = await fetchRetryLogById(row.id!);
  detailData.value = (res.data as Api.RetryLog.RetryLog) || null;
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <RetryLogSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getData" />
    <NCard
      :title="$t('page.retryLog.title')"
      :bordered="false"
      size="small"
      class="sm:flex-1-hidden card-wrapper"
      header-class="view-card-header"
    >
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="false"
          @delete="handleBatchDelete"
          @refresh="getData"
        />
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        :flex-height="!appStore.isMobile"
        :scroll-x="962"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
    </NCard>
    <RetryLogDetailDrawer v-model:visible="detailVisible" :row-data="detailData" />
  </div>
</template>

<style scoped></style>
