<script setup lang="ts">
import { $t } from '@/locales';
import { translateOptions } from '@/utils/common';
import { retryStatusTypeOptions } from '@/constants/business';
import SelectGroup from '@/components/common/select-group.vue';
import SelectScene from '@/components/common/select-scene.vue';

defineOptions({
  name: 'RetryTaskSearch'
});

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const model = defineModel<Api.RetryTask.RetryTaskSearchParams>('model', { required: true });

function reset() {
  emit('reset');
}

function search() {
  emit('search');
}
</script>

<template>
  <SearchForm :model="model" @search="search" @reset="reset">
    <NFormItemGi span="24 s:12 m:6" :label="$t('page.retryTask.groupName')" path="groupName" class="pr-24px">
      <SelectGroup v-model:value="model.groupName" clearable />
    </NFormItemGi>
    <NFormItemGi span="24 s:12 m:6" :label="$t('page.retryTask.sceneName')" path="sceneName" class="pr-24px">
      <SelectScene v-model:value="model.sceneName" :group-name="model.groupName as string" clearable />
    </NFormItemGi>
<!--    <NFormItemGi span="24 s:12 m:6" :label="$t('page.retryTask.uniqueId')" path="uniqueId" class="pr-24px">-->
<!--      <NInput v-model:value="model.uniqueId" :placeholder="$t('page.retryTask.form.uniqueId')" clearable />-->
<!--    </NFormItemGi>-->
    <NFormItemGi span="24 s:12 m:6" :label="$t('page.retryTask.idempotentId')" path="idempotentId" class="pr-24px">
      <NInput v-model:value="model.idempotentId" :placeholder="$t('page.retryTask.form.idempotentId')" clearable />
    </NFormItemGi>
    <NFormItemGi span="24 s:12 m:6" :label="$t('page.retryTask.bizNo')" path="bizNo" class="pr-24px">
      <NInput v-model:value="model.bizNo" :placeholder="$t('page.retryTask.form.bizNo')" clearable />
    </NFormItemGi>
    <NFormItemGi span="24 s:12 m:6" :label="$t('page.retryTask.retryStatus')" path="retryStatus" class="pr-24px">
      <NSelect
        v-model:value="model.retryStatus"
        :placeholder="$t('page.retryTask.form.retryStatus')"
        :options="translateOptions(retryStatusTypeOptions)"
        clearable
      />
    </NFormItemGi>
  </SearchForm>
</template>

<style scoped></style>
