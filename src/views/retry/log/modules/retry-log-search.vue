<script setup lang="ts">
import { $t } from '@/locales';
import { translateOptions } from '@/utils/common';
import { retryStatusTypeOptions } from '@/constants/business';
import SelectGroup from '@/components/common/select-group.vue';
import SelectScene from '@/components/common/select-scene.vue';
import DatetimeRange from '@/components/common/datetime-range.vue';

defineOptions({
  name: 'RetryLogSearch'
});

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.RetryLog.RetryTaskSearchParams>('model', { required: true });

function reset() {
  emit('reset');
}

function search() {
  emit('search');
}
</script>

<template>
  <SearchForm btn-span="24 xl:3" :model="model" @search="search" @reset="reset">
    <NFormItemGi span="24 s:12 m:6" :label="$t('page.retryLog.groupName')" path="groupName" class="pr-24px">
      <SelectGroup v-model:value="model.groupName" clearable />
    </NFormItemGi>
    <NFormItemGi span="24 s:12 m:6" :label="$t('page.retryLog.sceneName')" path="sceneName" class="pr-24px">
      <SelectScene v-model:value="model.sceneName" :group-name="model.groupName as string" clearable />
    </NFormItemGi>
<!--    <NFormItemGi span="24 s:12 m:6" :label="$t('page.retryLog.UniqueId')" path="UniqueId" class="pr-24px">-->
<!--      <NInput v-model:value="model.uniqueId" :placeholder="$t('page.retryLog.form.UniqueId')" clearable />-->
<!--    </NFormItemGi>-->
<!--    <NFormItemGi span="24 s:12 m:6" :label="$t('page.retryLog.idempotentId')" path="idempotentId" class="pr-24px">-->
<!--      <NInput v-model:value="model.idempotentId" :placeholder="$t('page.retryLog.form.idempotentId')" clearable />-->
<!--    </NFormItemGi>-->
<!--    <NFormItemGi span="24 s:12 m:6" :label="$t('page.retryLog.bizNo')" path="bizNo" class="pr-24px">-->
<!--      <NInput v-model:value="model.bizNo" :placeholder="$t('page.retryLog.form.bizNo')" clearable />-->
<!--    </NFormItemGi>-->
    <NFormItemGi span="24 s:12 m:6" :label="$t('page.retryLog.retryStatus')" path="taskBatchStatus" class="pr-24px">
      <NSelect
        v-model:value="model.retryStatus"
        :placeholder="$t('page.retryTask.form.retryStatus')"
        :options="translateOptions(retryStatusTypeOptions)"
        clearable
      />
    </NFormItemGi>
    <NFormItemGi
      span="24 s:24 m:15 l:12 xl:9"
      :label="$t('page.common.createTime')"
      path="datetimeRange"
      class="pr-24px"
    >
      <DatetimeRange v-model:value="model.datetimeRange!" />
    </NFormItemGi>
  </SearchForm>
</template>

<style scoped></style>
