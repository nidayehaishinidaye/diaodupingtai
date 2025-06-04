<script setup lang="tsx">
import { fetchGetExecutorList } from '@/service/api';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useTable, useTableOperate } from '@/hooks/common/table';
import JobExecutorSearch from '@/views/job/executor/modules/job-executor-search.vue';
const appStore = useAppStore();

const { columns, data, getData, loading, mobilePagination, searchParams, resetSearchParams } = useTable({
  apiFn: fetchGetExecutorList,
  apiParams: {
    page: 1,
    size: 10,
    groupName: null,
    executorInfo: null
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'id',
      title: $t('common.index'),
      align: 'center',
      width: 48
    },
    {
      key: 'groupName',
      title: $t('page.jobTask.groupName'),
      align: 'left',
      width: 150
    },
    {
      key: 'executorInfo',
      title: $t('page.jobTask.executorInfo'),
      align: 'left',
      width: 120
    },

    {
      key: 'updateDt',
      title: $t('page.jobTask.updateDt'),
      align: 'center',
      width: 120
    }
  ]
});

const {
  checkedRowKeys
  // closeDrawer
} = useTableOperate(data, getData);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <JobExecutorSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getData" />
    <DeleteAlert />
    <NCard
      :title="$t('page.jobTask.title')"
      :bordered="false"
      size="small"
      class="sm:flex-1-hidden card-wrapper"
      header-class="view-card-header"
    >
      <template #header-extra>
        <TableHeaderOperation
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :show-add="false"
          @refresh="getData"
        />
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        :flex-height="!appStore.isMobile"
        :scroll-x="1000"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
