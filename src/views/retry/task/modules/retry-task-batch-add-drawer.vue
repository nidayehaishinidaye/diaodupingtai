<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import OperateDrawer from '@/components/common/operate-drawer.vue';
import { $t } from '@/locales';
import { fetchBatchAddRetryTask } from '@/service/api';
import { translateOptions } from '@/utils/common';
import { retryStatusTypeOptions } from '@/constants/business';
import SelectGroup from '@/components/common/select-group.vue';

defineOptions({
  name: 'RetryTaskBatchAddDrawer'
});

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

type Model = Pick<Api.RetryTask.RetryTaskBatchAdd, 'groupName' | 'retryStatus' | 'logStr'>;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    groupName: '',
    retryStatus: 0,
    logStr: ''
  };
}

type RuleKey = Extract<keyof Model, 'groupName' | 'retryStatus' | 'logStr'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  groupName: defaultRequiredRule,
  retryStatus: defaultRequiredRule,
  logStr: defaultRequiredRule
};

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  const { groupName, retryStatus, logStr } = model;
  const { error } = await fetchBatchAddRetryTask({ groupName, retryStatus, logStr });
  if (error) return;
  window.$message?.success($t('common.addSuccess'));

  closeDrawer();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    restoreValidation();
  }
});
</script>

<template>
  <OperateDrawer v-model="visible" :title="$t('page.retryTask.batchAddRetryTask')" @handle-submit="handleSubmit">
    <NForm ref="formRef" :model="model" :rules="rules">
      <NFormItem :label="$t('page.retryTask.groupName')" path="groupName">
        <SelectGroup v-model:value="model.groupName" />
      </NFormItem>
      <NFormItem :label="$t('page.retryTask.retryStatus')" path="retryStatus">
        <NSelect
          v-model:value="model.retryStatus"
          :placeholder="$t('page.retryTask.form.retryStatus')"
          :options="translateOptions(retryStatusTypeOptions)"
        />
      </NFormItem>
      <NFormItem :label="$t('page.retryTask.form.logStr')" path="logStr">
        <NInput v-model:value="model.logStr" type="textarea" :placeholder="$t('page.retryTask.form.logStr')" />
      </NFormItem>
    </NForm>
    <template #footer>
      <NSpace :size="16">
        <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" @click="handleSubmit">{{ $t('common.save') }}</NButton>
      </NSpace>
    </template>
  </OperateDrawer>
</template>

<style scoped></style>
