<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import OperateDrawer from '@/components/common/operate-drawer.vue';
import { $t } from '@/locales';
import { blockStrategyRecordOptions, enableStatusNumberOptions } from '@/constants/business';
import { fetchAddJob, fetchEditJob } from '@/service/api';
import RouteKey from '@/components/common/route-key.vue';
import ExecutorType from '@/components/common/executor-type.vue';
import TaskType from '@/components/common/task-type.vue';
import CodeMirror from '@/components/common/code-mirror.vue';
import JobTriggerInterval from '@/components/common/job-trigger-interval.vue';
import { translateOptions } from '@/utils/common';

defineOptions({
  name: 'JobTaskOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.Job.Job | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});
// const argsTags = ref<string[]>([]);
const dynamicForm = reactive({
  args: [{ arg: '' }]
});
const shardNum = ref(0);

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('page.jobTask.addJobTask'),
    edit: $t('page.jobTask.editJobTask')
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.Job.Job,
  | 'id'
  | 'groupName'
  | 'jobName'
  | 'argsStr'
  | 'argsType'
  | 'jobStatus'
  | 'routeKey'
  | 'executorType'
  | 'executorInfo'
  | 'triggerType'
  | 'triggerInterval'
  | 'blockStrategy'
  | 'executorTimeout'
  | 'maxRetryTimes'
  | 'retryInterval'
  | 'taskType'
  | 'parallelNum'
  | 'description'
>;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    groupName: '',
    jobName: '',
    argsStr: '',
    argsType: 1,
    jobStatus: 1,
    routeKey: 4,
    executorType: 1,
    triggerType: 2,
    executorInfo: '',
    triggerInterval: '60',
    blockStrategy: 1,
    executorTimeout: 60,
    maxRetryTimes: 3,
    retryInterval: 1,
    taskType: 1,
    parallelNum: 1,
    description: ''
  };
}

type RuleKey = Extract<
  keyof Model,
  | 'groupName'
  | 'jobName'
  | 'argsType'
  | 'jobStatus'
  | 'routeKey'
  | 'executorType'
  | 'triggerType'
  | 'executorInfo'
  | 'triggerInterval'
  | 'blockStrategy'
  | 'executorTimeout'
  | 'maxRetryTimes'
  | 'retryInterval'
  | 'taskType'
  | 'parallelNum'
>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  groupName: defaultRequiredRule,
  jobName: defaultRequiredRule,
  argsType: defaultRequiredRule,
  jobStatus: defaultRequiredRule,
  routeKey: defaultRequiredRule,
  executorType: defaultRequiredRule,
  executorInfo: defaultRequiredRule,
  triggerType: defaultRequiredRule,
  triggerInterval: defaultRequiredRule,
  blockStrategy: defaultRequiredRule,
  executorTimeout: defaultRequiredRule,
  maxRetryTimes: defaultRequiredRule,
  retryInterval: defaultRequiredRule,
  taskType: defaultRequiredRule,
  parallelNum: defaultRequiredRule
};

function handleUpdateModelWhenEdit() {
  if (props.operateType === 'add') {
    Object.assign(model, createDefaultModel());
    return;
  }

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model, props.rowData);
    if (model.taskType === 3 && model.argsStr) {
      Object.assign(dynamicForm, {
        args: JSON.parse(model.argsStr).map((item: string) => {
          return { arg: item };
        })
      });
    }

    if (model.taskType === 5 && model.argsStr) {
      const argsJson = JSON.parse(model.argsStr);
      shardNum.value = argsJson.shardNum;
      model.argsStr = argsJson.argsStr;
    }
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  if (props.operateType === 'add') {
    const {
      groupName,
      jobName,
      argsType,
      argsStr,
      jobStatus,
      routeKey,
      executorType,
      executorInfo,
      triggerType,
      triggerInterval,
      blockStrategy,
      executorTimeout,
      maxRetryTimes,
      retryInterval,
      taskType,
      parallelNum,
      description
    } = model;
    const { error } = await fetchAddJob({
      groupName,
      jobName,
      argsStr: taskType === 5 ? JSON.stringify({ shardNum: shardNum.value, argsStr }) : argsStr,
      argsType,
      jobStatus,
      routeKey,
      executorType,
      executorInfo,
      triggerType,
      triggerInterval,
      blockStrategy,
      executorTimeout,
      maxRetryTimes,
      retryInterval,
      taskType,
      parallelNum,
      description
    });
    if (error) return;
    window.$message?.success($t('common.addSuccess'));
  }

  if (props.operateType === 'edit') {
    const {
      id,
      groupName,
      jobName,
      argsStr,
      argsType,
      jobStatus,
      routeKey,
      executorType,
      executorInfo,
      triggerType,
      triggerInterval,
      blockStrategy,
      executorTimeout,
      maxRetryTimes,
      retryInterval,
      taskType,
      parallelNum,
      description
    } = model;
    const { error } = await fetchEditJob({
      id,
      groupName,
      jobName,
      argsStr: taskType === 5 ? JSON.stringify({ shardNum: shardNum.value, argsStr }) : argsStr,
      argsType,
      jobStatus,
      routeKey,
      executorType,
      executorInfo,
      triggerType,
      triggerInterval,
      blockStrategy,
      executorTimeout,
      maxRetryTimes,
      retryInterval,
      taskType,
      parallelNum,
      description
    });
    if (error) return;
    window.$message?.success($t('common.updateSuccess'));
  }

  closeDrawer();
  emit('submitted');
}

function parseArgsStr() {
  if (model.taskType === 3 && dynamicForm.args) {
    const slices = dynamicForm.args.map(item => item.arg.trim()).filter(item => Boolean(item));
    model.argsStr = slices.length > 0 ? JSON.stringify(slices) : '';
  }
  return model.argsStr;
}

const removeItem = (index: number) => {
  dynamicForm.args.splice(index, 1);
};

const addItem = () => {
  dynamicForm.args.push({ arg: '' });
};

watch(visible, () => {
  if (visible.value) {
    handleUpdateModelWhenEdit();
    restoreValidation();
  }
});

/** 分片参数变化, 解析并序列化到model.argsStr */
watch(dynamicForm, () => {
  if (visible.value && model.taskType === 3) {
    parseArgsStr();
  }
});

/** 任务类型变化, 清理分片参数/方法参数 */
watch(
  () => model.taskType,
  taskType => {
    if (props.operateType === 'add') {
      if (visible.value) {
        if (taskType !== 3) {
          dynamicForm.args = [];
        }
        if (taskType !== 5) {
          shardNum.value = 1;
        }
        model.argsStr = '';
      }
    }
  }
);

const blockStrategyOptions = computed(() => {
  if (model.taskType === 1) {
    return translateOptions(blockStrategyRecordOptions).filter(item => item.value !== 3);
  }
  return translateOptions(blockStrategyRecordOptions);
});
</script>

<template>
  <OperateDrawer v-model="visible" :title="title" :min-size="480" @handle-submit="handleSubmit">
    <NForm ref="formRef" :model="model" :rules="rules">
      <NFormItem :label="$t('page.jobTask.jobName')" path="jobName">
        <NInput
          v-model:value="model.jobName"
          :maxlength="64"
          show-count
          :placeholder="$t('page.jobTask.form.jobName')"
        />
      </NFormItem>
      <NFormItem :label="$t('page.jobTask.groupName')" path="groupName">
        <SelectGroup v-model:value="model.groupName" :disabled="props.operateType === 'edit'" />
      </NFormItem>
      <NFormItem :label="$t('page.jobTask.jobStatus')" path="jobStatus">
        <NRadioGroup v-model:value="model.jobStatus" name="jobStatus">
          <NSpace>
            <NRadio
              v-for="item in enableStatusNumberOptions"
              :key="item.value"
              :value="item.value"
              :label="$t(item.label)"
            />
          </NSpace>
        </NRadioGroup>
      </NFormItem>
      <NFormItem :label="$t('page.jobTask.executorType')" path="executorType">
        <ExecutorType v-model:value="model.executorType" />
      </NFormItem>
      <NFormItem :label="$t('page.jobTask.executorInfo')" path="executorInfo">
        <NInput v-model:value="model.executorInfo" :placeholder="$t('page.jobTask.form.executorInfo')" />
      </NFormItem>
      <NFormItem :label="$t('page.jobTask.taskType')" path="taskType">
        <TaskType v-model:value="model.taskType" :placeholder="$t('page.jobTask.form.taskType')" />
      </NFormItem>
      <NFormItem v-if="model.taskType === 5" :label="$t('page.jobTask.shardNum')">
        <NInputNumber v-model:value="shardNum" :min="1" :placeholder="$t('page.jobTask.form.shardNum')" />
      </NFormItem>
      <NFormItem
        :label="$t('page.jobTask.argsStr')"
        path="argsStr"
        :rule="model.taskType === 3 ? defaultRequiredRule : undefined"
      >
        <NCard v-if="model.taskType === 3" class="flex-col">
          <NFormItem
            v-for="(item, index) in dynamicForm.args"
            :key="index"
            :label="`分片参数 ${index + 1}`"
            :path="`args[${index}].arg`"
            :show-feedback="false"
            class="m-b-12px"
            :rule="{
              required: true,
              message: `${$t('page.jobTask.form.argsStr')} ${index + 1}`,
              trigger: ['input', 'blur'],
              validator() {
                return !!item.arg;
              }
            }"
          >
            <CodeMirror v-model="item.arg" lang="json" :placeholder="$t('page.jobTask.form.argsStr')" />
            <NButton class="ml-12px" type="error" dashed @click="removeItem(index)">
              <icon-ic-round-delete class="text-icon" />
            </NButton>
          </NFormItem>
          <NButton block dashed attr-type="button" @click="addItem"><icon-ic-round-plus class="text-icon" /></NButton>
        </NCard>
        <CodeMirror v-else v-model="model.argsStr" lang="json" :placeholder="$t('page.jobTask.form.argsStr')" />
      </NFormItem>
      <NGrid cols="2 s:1 m:2" responsive="screen" x-gap="20">
        <NGi>
          <NFormItem :label="$t('page.jobTask.routeKey')" path="routeKey">
            <RouteKey v-model:value="model.routeKey" :task-type="model.taskType" />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem :label="$t('page.jobTask.blockStrategy')" path="blockStrategy">
            <NSelect
              v-model:value="model.blockStrategy"
              :placeholder="$t('common.blockStrategy.form')"
              :options="blockStrategyOptions"
            />
          </NFormItem>
        </NGi>
      </NGrid>
      <NGrid cols="2 s:1 m:2" responsive="screen" x-gap="20">
        <NGi>
          <NFormItem :label="$t('page.jobTask.triggerType')" path="triggerType">
            <TriggerType v-model:value="model.triggerType" :placeholder="$t('page.jobTask.form.triggerType')" />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem :label="$t('page.jobTask.triggerInterval')" path="triggerInterval">
            <JobTriggerInterval v-model="model.triggerInterval" :trigger-type="model.triggerType" />
          </NFormItem>
        </NGi>
      </NGrid>
      <NGrid cols="2 s:1 m:2" responsive="screen" x-gap="20">
        <NGi>
          <NFormItem :label="$t('page.jobTask.executorTimeout')" path="executorTimeout">
            <NInputGroup>
              <NInputNumber
                v-model:value="model.executorTimeout"
                :min="1"
                :max="99999999"
                :placeholder="$t('page.jobTask.form.executorTimeout')"
                clearable
              />
              <NInputGroupLabel>{{ $t('common.second') }}</NInputGroupLabel>
            </NInputGroup>
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem :label="$t('page.jobTask.maxRetryTimes')" path="maxRetryTimes">
            <NInputNumber
              v-model:value="model.maxRetryTimes"
              :min="0"
              :max="999"
              :placeholder="$t('page.jobTask.form.maxRetryTimes')"
              clearable
            />
          </NFormItem>
        </NGi>
      </NGrid>
      <NGrid cols="2 s:1 m:2" responsive="screen" x-gap="20">
        <NGi>
          <NFormItem :label="$t('page.jobTask.retryInterval')" path="retryInterval">
            <NInputGroup>
              <NInputNumber
                v-model:value="model.retryInterval"
                :min="1"
                :max="99999999"
                :placeholder="$t('page.jobTask.form.retryInterval')"
                clearable
              />
              <NInputGroupLabel>{{ $t('common.second') }}</NInputGroupLabel>
            </NInputGroup>
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem v-if="model.taskType !== 1" :label="$t('page.jobTask.parallelNum')" path="parallelNum">
            <NInputNumber
              v-model:value="model.parallelNum"
              :min="1"
              :max="999"
              :placeholder="$t('page.jobTask.form.parallelNum')"
              clearable
            />
          </NFormItem>
        </NGi>
      </NGrid>
      <NFormItem :label="$t('page.jobTask.description')" path="description">
        <NInput v-model:value="model.description" type="textarea" :placeholder="$t('page.jobTask.form.description')" />
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
