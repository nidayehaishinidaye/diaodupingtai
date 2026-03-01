<script setup lang="ts">
import {fetchGetSystemVarList} from "@/service/api/system-variable";
import { onMounted, ref, computed} from 'vue'

onMounted(() => {
  getSystemVariables();
});

const content = defineModel<{ key: string; value: string | number | boolean; type: string }[]>('value', {
  required: true,
  default: () => []
});

const path = defineModel<string>('path', {
  required: true
});

const onCreate = () => {
  return {
    key: '',
    value: '',
    type: 'string'
  };
};

const dynamicInputRule = [
  {
    trigger: ['input', 'blur'],
    validator(_: unknown, value: string | number | boolean) {
      if (!value && value !== 0 && typeof value !== 'boolean') return new Error('不能为空');
      return true;
    }
  }
];
const inputValue = ref('');
const syncOptions = ref([
  {
    label: String,
    value: String
  }
]);

const  getSystemVariables = async () =>{
  const { error,data } = await fetchGetSystemVarList();
  if (!error) {
    syncOptions.value = data.map(item => ({
      label: item.variableName,
      value: item.variableKey.replace("$",'')
    }));
  }
};



const typeOptions = [
  {
    label: 'string',
    value: 'string'
  },
  {
    label: 'number',
    value: 'number'
  },
  {
    label: 'boolean',
    value: 'boolean'
  }
];

const boolenOptions = [
  {
    label: 'true',
    value: 1
  },
  {
    label: 'false',
    value: 0
  }
];

const handleUpdateType = (index: number) => {
  if (content.value[index].type === 'string') {
    content.value[index].value = '';
  }

  if (content.value[index].type === 'boolean') {
    content.value[index].value = 0;
  }

  if (content.value[index].type === 'number') {
    content.value[index].value = 0;
  }
};

const handleInputBlur = (index: number) => {
  // 仅清首尾空格
  content.value[index].value =content.value[index].value .trim();
  // 若需合并中间空格：inputValue.value = inputValue.value.trim().replace(/\s+/g, ' ');
};
</script>

<template>
  <NDynamicInput v-model:value="content" item-style="margin-bottom: 0;" :on-create="onCreate" #="{ index }">
    <NGrid>
      <NFormItemGi
        :span="7"
        ignore-path-change
        :show-label="false"
        :rule="dynamicInputRule"
        :path="`${path}[${index}].key`"
      >
        <NInput v-model:value="content[index].key" placeholder="key" @keydown.enter.prevent />
      </NFormItemGi>
      <NGi :span="2" class="h-34px text-center lh-34px">=</NGi>
      <NFormItemGi
        :span="7"
        ignore-path-change
        :show-label="false"
        :rule="dynamicInputRule"
        :path="`${path}[${index}].value`"
      >
<!--        <NInput-->
<!--          v-if="content[index].type === 'string'"-->
<!--          v-model:value="content[index].value as string"-->
<!--          placeholder="value"-->
<!--          @keydown.enter.prevent-->
<!--        />-->

        <n-mention
          v-if="content[index].type === 'string'"
          v-model:value="content[index].value as string"
          placeholder="value"
          :options="syncOptions"
          default-value="@"
          :prefix="['$']"
          @keydown.enter.prevent
          @blur="handleInputBlur(index)"
        />
        <NPopover trigger="hover"
                  v-if="content[index].type === 'string'"
        >
          <template #trigger>
            <NButton text>
              <SvgIcon icon="ant-design:info-circle-outlined" class="text-18px color-blue" />
            </NButton>
          </template>
          输入$提示变量信息
        </NPopover>

        <NInputNumber
          v-if="content[index].type === 'number'"
          v-model:value="content[index].value as number"
          class="w-full"
          placeholder="value"
          @keydown.enter.prevent
        />
        <NSelect
          v-if="content[index].type === 'boolean'"
          v-model:value="content[index].value as number"
          class="w-full"
          :options="boolenOptions"
          placeholder="value"
          @keydown.enter.prevent
        />
      </NFormItemGi>
      <NFormItemGi
        :span="3"
        class="ml-12px w-115px"
        ignore-path-change
        :show-label="false"
        :path="`${path}[${index}].type`"
      >
        <div class="h-34px lh-34px">(</div>
        <NSelect
          v-model:value="content[index].type"
          class="mx-3px"
          :options="typeOptions"
          placeholder="字段类型"
          @keydown.enter.prevent
          @update:value="handleUpdateType(index)"
        />
        <div class="h-34px lh-34px">)</div>
      </NFormItemGi>
    </NGrid>
  </NDynamicInput>
</template>

<style scoped></style>
