<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { retryStatusTypeOptions, retryStatusTypeRecord } from '@/constants/business';
import { fetchBatchUpdateRetryStatus } from '@/service/api';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { translateOptions } from '@/utils/common';
import OperateDrawer from '@/components/common/operate-drawer.vue';
import { $t } from '@/locales';

defineOptions({
  name: 'RetryTaskBatchUpdateDrawer'
});

interface Props {
  searchParams?: Api.Retry.RetrySearchParams;
  total?: number;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

type Model = {
  status: Api.Retry.RetryStatusType;
};

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    status: 0
  };
}

type RuleKey = Extract<keyof Model, 'status'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  status: defaultRequiredRule
};

function closeDrawer() {
  visible.value = false;
}

// 检查是否有状态搜索条件（必选项）
const hasRetryStatus = computed(() => {
  return props.searchParams?.retryStatus !== null && props.searchParams?.retryStatus !== undefined;
});

// 检查待更新数据量是否为0
const isTotalZero = computed(() => {
  return typeof props.total === 'number' && props.total === 0;
});

// 检查搜索条件中的状态和用户选择的状态是否一致
const isStatusSame = computed(() => {
  const searchStatus = props.searchParams?.retryStatus;
  if (searchStatus === null || searchStatus === undefined) {
    return false;
  }
  return searchStatus === model.status;
});

// 构建请求参数
function buildRequestData(status: Api.Retry.RetryStatusType): Api.Retry.BatchUpdateRetryStatusRequest {
  const requestData: Api.Retry.BatchUpdateRetryStatusRequest = {
    status
  };

  // 只添加有值的搜索条件
  if (props.searchParams?.groupName) {
    requestData.groupName = props.searchParams.groupName;
  }
  if (props.searchParams?.sceneName) {
    requestData.sceneName = props.searchParams.sceneName;
  }
  if (props.searchParams?.idempotentId) {
    requestData.idempotentId = props.searchParams.idempotentId;
  }
  if (props.searchParams?.bizNo) {
    requestData.bizNo = props.searchParams.bizNo;
  }
  if (props.searchParams?.retryStatus !== null && props.searchParams?.retryStatus !== undefined) {
    requestData.retryStatus = props.searchParams.retryStatus;
  }

  return requestData;
}

// 验证提交前的条件
function validateSubmitConditions(): boolean {
  // 检查是否有状态搜索条件（必选项）
  if (!hasRetryStatus.value) {
    window.$message?.warning($t('page.retry.retryStatusRequiredTip'));
    return false;
  }

  // 检查待更新数据量是否为0
  if (isTotalZero.value) {
    window.$message?.warning($t('page.retry.totalZeroTip'));
    return false;
  }

  // 检查搜索条件中的状态和用户选择的状态是否一致
  if (isStatusSame.value) {
    window.$message?.warning($t('page.retry.statusSameTip'));
    return false;
  }

  return true;
}

async function handleSubmit() {
  if (!validateSubmitConditions()) {
    return;
  }

  await validate();

  const { status } = model;
  const requestData = buildRequestData(status);

  const { error, data: updateCount } = await fetchBatchUpdateRetryStatus(requestData);
  if (error) return;

  // 显示更新总数
  const count = Number(updateCount) || 0;
  const successMessage = `${$t('page.retry.batchUpdateSuccess')}${count}${$t('page.retry.records')}`;
  window.$message?.success(successMessage);

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
  <OperateDrawer v-model="visible" :title="$t('common.batchUpdate')" @handle-submit="handleSubmit">
    <!-- 无状态搜索条件时只显示提示 -->
    <template v-if="!hasRetryStatus">
      <NAlert type="error" :bordered="false">
        {{ $t('page.retry.retryStatusRequiredTip') }}
      </NAlert>
    </template>

    <!-- 有状态搜索条件时显示完整内容 -->
    <template v-else>
      <NAlert type="warning" :bordered="false" class="mb-16px">
        {{ $t('page.retry.batchUpdateTip') }}
      </NAlert>

      <!-- 搜索条件展示 -->
      <div class="mb-16px">
        <div class="mb-8px text-14px font-medium">{{ $t('page.retry.searchConditions') }}</div>
        <NDescriptions :column="1" label-placement="left" bordered :label-style="{ width: '120px' }">
          <NDescriptionsItem v-if="props.searchParams?.groupName" :label="$t('page.retry.groupName')">
            {{ props.searchParams.groupName }}
          </NDescriptionsItem>
          <NDescriptionsItem v-if="props.searchParams?.sceneName" :label="$t('page.retry.sceneName')">
            {{ props.searchParams.sceneName }}
          </NDescriptionsItem>
          <NDescriptionsItem v-if="props.searchParams?.idempotentId" :label="$t('page.retry.idempotentId')">
            {{ props.searchParams.idempotentId }}
          </NDescriptionsItem>
          <NDescriptionsItem v-if="props.searchParams?.bizNo" :label="$t('page.retry.bizNo')">
            {{ props.searchParams.bizNo }}
          </NDescriptionsItem>
          <NDescriptionsItem
            v-if="props.searchParams?.retryStatus !== null && props.searchParams?.retryStatus !== undefined"
            :label="$t('page.retry.retryStatus')"
          >
            {{ $t(retryStatusTypeRecord[props.searchParams.retryStatus!]) }}
          </NDescriptionsItem>
        </NDescriptions>
      </div>

      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem :label="$t('page.retry.retryStatus')" path="status">
          <NSelect
            v-model:value="model.status"
            :placeholder="$t('page.retry.form.retryStatus')"
            :options="translateOptions(retryStatusTypeOptions)"
          />
        </NFormItem>
        <div v-if="typeof props.total === 'number'" class="mt-8px text-14px">
          <span class="text-gray-500">{{ $t('page.retry.estimatedUpdateData') }}：</span>
          <span class="text-primary font-medium">{{ props.total }}</span>
        </div>
        <NAlert v-if="isStatusSame" type="warning" :bordered="false" class="mt-16px">
          {{ $t('page.retry.statusSameTip') }}
        </NAlert>
        <NAlert v-if="isTotalZero" type="warning" :bordered="false" class="mt-16px">
          {{ $t('page.retry.totalZeroTip') }}
        </NAlert>
      </NForm>
    </template>

    <template #footer>
      <NSpace :size="16">
        <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
        <NButton v-if="hasRetryStatus" type="primary" :disabled="isStatusSame || isTotalZero" @click="handleSubmit">
          {{ $t('common.save') }}
        </NButton>
      </NSpace>
    </template>
  </OperateDrawer>
</template>

<style scoped></style>
