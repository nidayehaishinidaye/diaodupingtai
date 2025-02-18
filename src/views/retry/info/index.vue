<script setup lang="tsx">
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { onMounted, ref } from 'vue';
import { useBoolean } from '~/packages/hooks';
import {
  fetchBatchDeleteRetryTask,
  fetchExecuteCallbackTask,
  fetchExecuteRetryTask,
  fetchGetAllGroupNameList,
  fetchGetRetryTaskById,
  fetchGetRetryTaskList,
  fetchUpdateRetryTaskStatus
} from '@/service/api';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { retryStatusTypeRecord, retryTaskTypeRecord } from '@/constants/business';
import { tagColor } from '@/utils/common';
import RetryTaskOperateDrawer from './modules/retry-operate-drawer.vue';
import RetryTaskBatchAddDrawer from './modules/retr-batch-add-drawer.vue';
import RetryTaskSearch from './modules/retry-search.vue';
import RetryTaskDetailDrawerVue from './modules/retry-detail-drawer.vue';

/** 详情页属性数据 */
const detailData = ref<Api.Retry.Retry | null>();
/** 详情页可见状态 */
const { bool: detailVisible, setTrue: openDetail } = useBoolean(false);

const appStore = useAppStore();

const { columns, columnChecks, data, getData, loading, mobilePagination, searchParams, resetSearchParams } = useTable({
  apiFn: fetchGetRetryTaskList,
  apiParams: {
    page: 1,
    size: 10,
    groupName: null,
    sceneName: null,
    idempotentId: null,
    bizNo: null,
    retryStatus: null
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48,
      disabled: row => row.retryStatus === 0
    },
    {
      key: 'id',
      title: $t('common.index'),
      align: 'center',
      width: 128,
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
      title: $t('page.retryTask.groupName'),
      align: 'left',
      resizable: true,
      minWidth: 120,
      maxWidth: 250
    },
    {
      key: 'sceneName',
      title: $t('page.retryTask.sceneName'),
      align: 'left',
      minWidth: 120
    },
    {
      key: 'nextTriggerAt',
      title: $t('page.retryTask.nextTriggerAt'),
      align: 'left',
      resizable: true,
      minWidth: 120,
      maxWidth: 150
    },
    {
      key: 'retryCount',
      title: $t('page.retryTask.retryCount'),
      align: 'center',
      width: 80
    },
    {
      key: 'retryStatus',
      title: $t('page.retryTask.retryStatus'),
      align: 'left',
      width: 120,
      render: row => {
        if (row.retryStatus === null) {
          return null;
        }
        const label = $t(retryStatusTypeRecord[row.retryStatus!]);

        return <NTag type={tagColor(row.retryStatus!)}>{label}</NTag>;
      }
    },
    {
      key: 'taskType',
      title: $t('page.retryTask.taskType'),
      align: 'left',
      width: 100,
      render: row => {
        if (row.taskType === null) {
          return null;
        }
        const tagMap: Record<Api.Retry.TaskType, NaiveUI.ThemeColor> = {
          1: 'warning',
          2: 'error'
        };
        const label = $t(retryTaskTypeRecord[row.taskType!]);

        return <NTag type={tagMap[row.taskType!]}>{label}</NTag>;
      }
    },
    {
      key: 'idempotentId',
      title: $t('page.retryTask.idempotentId'),
      align: 'left',
      resizable: true,
      minWidth: 150,
      maxWidth: 300
    },
    {
      key: 'bizNo',
      title: $t('page.retryTask.bizNo'),
      align: 'left',
      resizable: true,
      minWidth: 150,
      maxWidth: 300
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 260,
      fixed: 'right',
      render: row => (
        <div class="flex-center gap-8px">
          {/* 非[完成,最大次数], 显示[执行]按钮 */}
          {row.retryStatus !== 1 && row.retryStatus !== 2 ? (
            <>
              <NPopconfirm onPositiveClick={() => handleExecute(row.groupName!, row.id! as any, row.taskType!)}>
                {{
                  default: () => $t('common.confirmExecute'),
                  trigger: () => (
                    <NButton type="info" text ghost size="small">
                      {$t('common.execute')}
                    </NButton>
                  )
                }}
              </NPopconfirm>
              <n-divider vertical />
            </>
          ) : (
            ''
          )}
          {/* 非[完成,最大次数], 显示[完成]按钮 */}
          {row.retryStatus !== 1 && row.retryStatus !== 2 ? (
            <>
              <NPopconfirm onPositiveClick={() => handleFinish(Number(row.id!), row.groupName!)}>
                {{
                  default: () => $t('common.confirmFinish'),
                  trigger: () => (
                    <NButton type="warning" text ghost size="small">
                      {$t('common.finish')}
                    </NButton>
                  )
                }}
              </NPopconfirm>
              <n-divider vertical />
            </>
          ) : (
            ''
          )}
          {/* 重试中, 显示[停止]按钮 */}
          {row.retryStatus === 0 ? (
            <>
              <NPopconfirm onPositiveClick={() => handlePause(Number(row.id!), row.groupName!)}>
                {{
                  default: () => $t('common.confirmPause'),
                  trigger: () => (
                    <NButton type="success" text ghost size="small">
                      {$t('common.pause')}
                    </NButton>
                  )
                }}
              </NPopconfirm>
              <n-divider vertical />
            </>
          ) : (
            ''
          )}
          {/* 暂停, 显示[开始]按钮 */}
          {row.retryStatus === 3 ? (
            <>
              <NPopconfirm onPositiveClick={() => handleResume(Number(row.id!), row.groupName!)}>
                {{
                  default: () => $t('common.confirmResume'),
                  trigger: () => (
                    <NButton type="info" text ghost size="small">
                      {$t('common.resume')}
                    </NButton>
                  )
                }}
              </NPopconfirm>
              <n-divider vertical />
            </>
          ) : (
            ''
          )}
          {
            <NPopconfirm onPositiveClick={() => handleDelete(row.groupName!, row.id!)}>
              {{
                default: () => $t('common.confirmDelete'),
                trigger: () => (
                  <NButton type="error" text ghost size="small">
                    {$t('common.delete')}
                  </NButton>
                )
              }}
            </NPopconfirm>
          }
        </div>
      )
    }
  ]
});

const {
  drawerVisible,
  operateType,
  handleAdd,
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
  // closeDrawer
} = useTableOperate(data, getData);

const { bool: batchAddDrawerVisible, setTrue: openBatchAddDrawer } = useBoolean();

async function handleDelete(groupName: string, id: string) {
  const { error } = await fetchBatchDeleteRetryTask({ groupName, ids: [id] });
  if (error) return;
  onDeleted();
}

async function loadRetryInfo(row: Api.Retry.Retry) {
  const res = await fetchGetRetryTaskById(row.id!, row.groupName!);
  detailData.value = (res.data as Api.Retry.Retry) || null;
}

async function handleBatchDelete() {
  const ids: string[] = checkedRowKeys.value as string[];
  if (ids.length === 0) return;
  const groupName = data.value[0].groupName;
  const { error } = await fetchBatchDeleteRetryTask({ groupName, ids });
  if (error) return;
  onBatchDeleted();
}

function handleBatchAdd() {
  openBatchAddDrawer();
}

function handleExecute(groupName: string, retryId: number, type: Api.Retry.TaskType) {
  if (type === 1) {
    fetchExecuteRetryTask({ groupName, retryIds: [retryId] });
    return;
  }

  if (type === 2) {
    fetchExecuteCallbackTask({ groupName, retryIds: [retryId] });
  }
}

function handleResume(id: number, groupName: string) {
  updateRetryTaskStatus(id, groupName, 0);
}

function handlePause(id: number, groupName: string) {
  updateRetryTaskStatus(id, groupName, 3);
}

function handleFinish(id: number, groupName: string) {
  updateRetryTaskStatus(id, groupName, 1);
}

async function updateRetryTaskStatus(id: number, groupName: string, retryStatus: Api.Retry.RetryStatusType) {
  const { error } = await fetchUpdateRetryTaskStatus({ id, groupName, retryStatus });
  if (error) return;
  window.$message?.success($t('common.updateSuccess'));
  getData();
}

onMounted(async () => {
  const { error, data: groupList } = await fetchGetAllGroupNameList();
  if (!error && groupList.length > 0) {
    searchParams.groupName = groupList[0];
    getData();
  }
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <RetryTaskSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getData" />
    <NCard
      :title="$t('page.retryTask.title')"
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
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        >
          <template #addAfter>
            <NButton size="small" ghost type="primary" @click="handleBatchAdd">
              <template #icon>
                <icon-ic-round-plus class="text-icon" />
              </template>
              {{ $t('common.batchAdd') }}
            </NButton>
          </template>
        </TableHeaderOperation>
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        :flex-height="!appStore.isMobile"
        :scroll-x="2000"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <RetryTaskOperateDrawer v-model:visible="drawerVisible" :operate-type="operateType" @submitted="getData" />
      <RetryTaskBatchAddDrawer v-model:visible="batchAddDrawerVisible" @submitted="getData" />
      <RetryTaskDetailDrawerVue v-model:visible="detailVisible" :row-data="detailData" />
    </NCard>
  </div>
</template>

<style scoped></style>
