<script setup lang="tsx">
import { NTag } from 'naive-ui';
import { useAppStore } from '@/store/modules/app';
import { fetchPods } from '@/service/api';
import { $t } from '@/locales';
import { podsType } from '@/constants/business';
import { useTable, useTableOperate } from '@/hooks/common/table';
import LabelList from '@/components/common/label-list.vue';
import PodsSearch from './modules/pods-search.vue';

const appStore = useAppStore();

const { columns, columnChecks, data, getData, loading, mobilePagination, searchParams, resetSearchParams } = useTable({
  apiFn: fetchPods,
  apiParams: {
    page: 1,
    size: 10,
    groupName: null
  },
  columns: () => [
    {
      key: 'hostId',
      title: $t('page.pods.hostId'),
      align: 'left',
      resizable: true,
      width: 150,
      minWidth: 150,
      maxWidth: 200
    },
    {
      key: 'nodeType',
      title: $t('page.pods.nodeType'),
      align: 'center',
      width: 80,
      render: row => {
        if (row.nodeType === null) {
          return null;
        }

        const tagMap: Record<Api.Dashboard.DashboardPodsType, NaiveUI.ThemeColor> = {
          1: 'info',
          2: 'primary'
        };

        const label = $t(podsType[row.nodeType]);

        return <NTag type={tagMap[row.nodeType]}>{label}</NTag>;
      }
    },
    {
      key: 'groupName',
      title: $t('page.pods.groupName'),
      align: 'left',
      width: 120,
      resizable: true,
      minWidth: 120,
      maxWidth: 200
    },
    {
      key: 'labels',
      title: $t('page.pods.labels'),
      align: 'center',
      width: 120,
      render: row => {
        return <LabelList labels={JSON.parse(row.labels || '{}')} />;
      }
    },
    {
      key: 'hostIp',
      title: $t('page.pods.hostIp'),
      align: 'left',
      width: 120
    },
    {
      key: 'hostPort',
      title: $t('page.pods.hostPort'),
      align: 'left',
      width: 80
    },
    {
      key: 'consumerBuckets',
      title: $t('page.pods.consumerBuckets'),
      align: 'left',
      width: 300,
      resizable: true,
      minWidth: 120,
      maxWidth: 400,
      render: row => {
        if (row.nodeType === null) {
          return null;
        }

        const buckets = (slice?: number) => {
          const consumerBuckets = slice ? row.consumerBuckets?.slice(0, slice) : row.consumerBuckets;
          return consumerBuckets?.map(bucket => (
            <NTag type="error" key={bucket} class="m-1 justify-center">
              {bucket}
            </NTag>
          ));
        };

        const path = () => {
          return <NTag type="info">{row.contextPath ?? '/'}</NTag>;
        };

        return row.nodeType === 1 ? (
          <>Path: {path()}</>
        ) : (
          <>
            <span>Bucket: </span>
            {buckets(10)}
            <n-popover trigger="hover">
              {{
                trigger: () => <NTag type="error">...</NTag>,
                default: () => {
                  return <div class="grid grid-cols-16">{buckets()}</div>;
                }
              }}
            </n-popover>
          </>
        );
      }
    },
    {
      key: 'updateDt',
      title: $t('page.pods.updateDt'),
      align: 'left',
      width: 130
    }
  ]
});

const { checkedRowKeys } = useTableOperate(data, getData);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <PodsSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getData" />
    <NCard
      :title="$t('page.pods.title')"
      :bordered="false"
      size="small"
      header-class="view-card-header"
      class="sm:flex-1-hidden card-wrapper"
    >
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="false"
          :show-delete="false"
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
        :row-key="row => row.hostId"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
