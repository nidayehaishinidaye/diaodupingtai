<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { type FormInst, NInputNumber } from 'naive-ui';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import OperateDrawer from '@/components/common/operate-drawer.vue';
import { $t } from '@/locales';
import { enableStatusNumberOptions } from '@/constants/business';
import { fetchAddJob, fetchEditJob, fetchGetNotifyConfigSystemTaskTypeList } from '@/service/api';
import RouteKey from '@/components/common/route-key.vue';
import BlockStrategy from '@/components/common/block-strategy.vue';
import ExecutorType from '@/components/common/executor-type.vue';
import TaskType from '@/components/common/task-type.vue';
import CodeMirror from '@/components/common/code-mirror.vue';
import JobTriggerInterval from '@/components/common/job-trigger-interval.vue';
import { isNotNull } from '@/utils/common';
import SelectGroup from '@/components/common/select-group.vue';

defineOptions({
  name: 'JobTaskOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.Job.Job | null;
}

const notifyNameList = ref<CommonType.Option<number>[]>([]);
const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const executorCustomType = ref<0 | 1>(0);
const visible = defineModel<boolean>('visible', {
  default: false
});
// const argsTags = ref<string[]>([]);
const dynamicForm = reactive({
  args: [{ arg: '' }]
});
const shardNum = ref(0);

const customformRef = ref<FormInst | null>(null);
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
  | 'ownerId'
  | 'ownerName'
  | 'notifyIds'
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
  | 'notifyScene'
>;

async function getNotifyConfigSystemTaskTypeList() {
  const res = await fetchGetNotifyConfigSystemTaskTypeList(3);
  notifyNameList.value = res.data as CommonType.Option<number>[];
}

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    // @ts-expect-error groupName is required
    groupName: undefined,
    // @ts-expect-error owerId is required
    ownerId: undefined,
    notifyIds: [],
    jobName: '',
    argsStr: '',
    argsType: 1,
    jobStatus: 1,
    routeKey: 4,
    executorType: 1,
    triggerType: 2,
    // @ts-expect-error groupName is required
    executorInfo: undefined,
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

type HttpParams = {
  method: string;
  url: string;
  mediaType: string;
  body?: string;
  headers: {
    [key in string]: string;
  };
  timeout: number;
};

const httpHeaders = ref<{ key: string; value: string }[]>([]);

const httpParams = reactive<HttpParams>(createDefaultHttpParams());

function createDefaultHttpParams() {
  return {
    method: 'POST',
    url: '',
    headers: {},
    body: '',
    mediaType: 'application/json',
    timeout: 60
  };
}

const executorCustomOptions = [
  {
    label: 'Http 执行器',
    value: 'snailJobHttpExecutor'
  },
  {
    label: 'CMD 执行器',
    value: 'snailJobCMDJobExecutor'
  },
  {
    label: 'PowerShell 执行器',
    value: 'snailJobPowerShellJobExecutor'
  },
  {
    label: 'Shell 执行器',
    value: 'snailJobShellJobExecutor'
  }
];

type ScriptParams = {
  method: string;
  scriptParams: string;
  charset: string;
};

const scriptParams = reactive<ScriptParams>(createDefaultScriptParams());

function createDefaultScriptParams() {
  return {
    method: 'LOCAL_SCRIPT',
    scriptParams: '',
    charset: ''
  };
}

function handleUpdateModelWhenEdit() {
  if (props.operateType === 'add' && !props.rowData) {
    Object.assign(model, createDefaultModel());
    executorCustomType.value = 0;
    httpHeaders.value = [];
    Object.assign(httpParams, createDefaultHttpParams());
    Object.assign(scriptParams, createDefaultScriptParams());
    return;
  }

  if (props.rowData) {
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

    if (executorCustomOptions.map(item => item.value).includes(model.executorInfo)) {
      executorCustomType.value = 1;
      if (model.executorInfo === 'snailJobHttpExecutor') {
        Object.assign(httpParams, JSON.parse(model.argsStr));
        if (httpParams.headers) {
          httpHeaders.value = Object.keys(httpParams.headers).map((item: string) => {
            return { key: item, value: httpParams.headers![item] };
          });
        }
      } else {
        Object.assign(scriptParams, JSON.parse(model.argsStr));
      }
    }
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  const {
    id,
    groupName,
    ownerId,
    ownerName,
    notifyIds,
    jobName,
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

  let argsStr = taskType === 5 ? JSON.stringify({ shardNum: shardNum.value, argsStr: model.argsStr }) : model.argsStr;

  if (executorCustomType.value === 1) {
    await customformRef.value?.validate();
    if (model.executorInfo === 'snailJobHttpExecutor') {
      httpHeaders.value.forEach(item => {
        httpParams.headers[item.key] = item.value;
      });
      argsStr = JSON.stringify(httpParams);
    } else {
      argsStr = JSON.stringify(scriptParams);
    }
  }

  if (props.operateType === 'add') {
    const { error } = await fetchAddJob({
      groupName,
      ownerId,
      ownerName,
      notifyIds,
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
    });
    if (error) return;
    window.$message?.success($t('common.addSuccess'));
  }

  if (props.operateType === 'edit') {
    const { error } = await fetchEditJob({
      id,
      groupName,
      ownerId,
      ownerName,
      notifyIds,
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
    getNotifyConfigSystemTaskTypeList();
    customformRef.value?.restoreValidation();
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

function handleChangeExecutorCustomType() {
  if (executorCustomType.value === 0) {
    model.executorInfo = '';
    return;
  }
  model.executorInfo = 'snailJobHttpExecutor';
}

const httpMethodOptions = [
  {
    label: 'GET',
    value: 'get'
  },
  {
    label: 'POST',
    value: 'post'
  },
  {
    label: 'PUT',
    value: 'put'
  },
  {
    label: 'DELETE',
    value: 'delete'
  }
];

const scriptMethodOptions = [
  {
    label: '需下载脚本',
    value: 'DOWNLOAD'
  },
  {
    label: '脚本代码',
    value: 'SCRIPT_CODE'
  },
  {
    label: '使用本地脚本',
    value: 'LOCAL_SCRIPT'
  }
];
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
      <NFormItem :label="$t('page.jobTask.ownerName')" path="ownerId">
        <SystemUser v-model:value="model.ownerId" />
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
      <NFormItem :label="$t('page.jobTask.taskType')" path="taskType">
        <TaskType v-model:value="model.taskType" :placeholder="$t('page.jobTask.form.taskType')" />
      </NFormItem>
      <NFormItem :label="$t('page.jobTask.executorType')" path="executorType">
        <ExecutorType v-model:value="model.executorType" />
      </NFormItem>
      <NFormItem :label="$t('page.jobTask.executorInfo')" path="executorInfo">
        <div class="w-full w-full flex-col items-start gap-12px pt-5px">
          <NRadioGroup v-model:value="executorCustomType" @change="handleChangeExecutorCustomType">
            <NRadio :value="0">自定义执行器</NRadio>
            <NRadio :value="1">内置执行器</NRadio>
          </NRadioGroup>
          <NInput
            v-if="executorCustomType === 0"
            v-model:value="model.executorInfo"
            :placeholder="$t('page.jobTask.form.executorInfo')"
          />
          <NSelect
            v-else
            v-model:value="model.executorInfo"
            :options="executorCustomOptions"
            placeholder="请选择内置执行器"
          />
        </div>
      </NFormItem>
      <NFormItem v-if="model.taskType === 5" :label="$t('page.jobTask.shardNum')">
        <NInputNumber v-model:value="shardNum" :min="1" :placeholder="$t('page.jobTask.form.shardNum')" />
      </NFormItem>
      <NFormItem
        :label="$t('page.jobTask.argsStr')"
        path="argsStr"
        :show-label="executorCustomType === 0"
        :show-feedback="executorCustomType === 0"
        :rule="model.taskType === 3 ? defaultRequiredRule : undefined"
      >
        <template v-if="executorCustomType === 0">
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
            <NButton block dashed attr-type="button" @click="addItem">
              <icon-ic-round-plus class="text-icon" />
            </NButton>
          </NCard>
          <CodeMirror v-else v-model="model.argsStr" lang="json" :placeholder="$t('page.jobTask.form.argsStr')" />
        </template>
        <template v-else-if="model.executorInfo === 'snailJobHttpExecutor'">
          <NForm ref="customformRef" class="w-full" :model="httpParams">
            <NFormItem label="请求参数" :rule="defaultRequiredRule" path="url">
              <NInputGroup>
                <NSelect v-model:value="httpParams.method" class="http-method" :options="httpMethodOptions" />
                <NInput v-model:value="httpParams.url" placeholder="请输入请求地址" class="w-full" />
              </NInputGroup>
            </NFormItem>
            <NFormItem label="Media Type">
              <NInput v-model:value="httpParams.mediaType" placeholder="请输入 Media Type" />
            </NFormItem>
            <div class="n-form-item-label">Header 参数</div>
            <NDynamicInput
              v-model:value="httpHeaders"
              :class="httpHeaders.length ? undefined : 'mb-24px'"
              item-style="margin-bottom: 0;"
              :on-create="() => ({ key: '', value: '' })"
              #="{ index }"
            >
              <div class="flex">
                <NFormItem
                  ignore-path-change
                  :show-label="false"
                  :path="`headers[${index}].key`"
                  :rule="{
                    required: true,
                    message: `请输入键`,
                    trigger: ['input', 'blur'],
                    validator: () => isNotNull(httpHeaders[index].key)
                  }"
                >
                  <NInput v-model:value="httpHeaders[index].key" placeholder="Key" @keydown.enter.prevent />
                </NFormItem>
                <div class="mx-8px h-34px text-center line-height-34px">=</div>
                <NFormItem
                  ignore-path-change
                  :show-label="false"
                  :path="`headers[${index}].value`"
                  :rule="{
                    required: true,
                    message: `请输入值`,
                    trigger: ['input', 'blur'],
                    validator: () => isNotNull(httpHeaders[index].value)
                  }"
                >
                  <NInput v-model:value="httpHeaders[index].value" placeholder="Value" @keydown.enter.prevent />
                </NFormItem>
              </div>
            </NDynamicInput>
            <NFormItem label="Body 参数">
              <CodeMirror v-model="httpParams.body" lang="json" placeholder="请输入 Body 参数" />
            </NFormItem>
            <NFormItem label="接口超时时间">
              <NInputGroup>
                <NInputNumber
                  v-model:value="httpParams.timeout"
                  class="w-full"
                  :min="1"
                  :max="99999999"
                  :placeholder="$t('page.jobTask.form.executorTimeout')"
                  clearable
                />
                <NInputGroupLabel>{{ $t('common.second') }}</NInputGroupLabel>
              </NInputGroup>
            </NFormItem>
          </NForm>
        </template>
        <template v-else>
          <NForm ref="customformRef" class="w-full" :model="scriptParams">
            <NFormItem label="脚本类型">
              <NSelect v-model:value="scriptParams.method" :options="scriptMethodOptions" />
            </NFormItem>
            <NFormItem label="脚本参数">
              <CodeMirror v-model="scriptParams.scriptParams" lang="json" placeholder="请输入脚本参数" />
            </NFormItem>
            <NFormItem label="编码格式">
              <NInput v-model:value="scriptParams.charset" placeholder="请输入编码格式" />
            </NFormItem>
          </NForm>
        </template>
      </NFormItem>
      <NGrid cols="2 s:1 m:2" responsive="screen" x-gap="20">
        <NGi>
          <NFormItem :label="$t('page.jobTask.routeKey')" path="routeKey">
            <RouteKey v-model:value="model.routeKey" :task-type="model.taskType" />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem :label="$t('page.jobTask.blockStrategy')" path="blockStrategy">
            <BlockStrategy v-model:value="model.blockStrategy" />
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
          <NFormItem
            v-if="model.taskType !== 1 && model.taskType !== 2"
            :label="$t('page.jobTask.parallelNum')"
            path="parallelNum"
          >
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
      <NFormItem :label="$t('page.jobTask.notifyId')" path="notifyIds">
        <NSelect
          v-model:value="model.notifyIds"
          value-field="id"
          label-field="notifyName"
          :placeholder="$t('page.jobTask.form.notifyId')"
          :options="notifyNameList"
          clearable
          multiple
        />
      </NFormItem>
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

<style scoped>
.http-method {
  width: 130px !important;
}
</style>
