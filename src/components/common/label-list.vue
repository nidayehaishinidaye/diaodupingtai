<script setup lang="tsx">
import { NDynamicTags, NInput, NPopover, NTag } from 'naive-ui';
import { computed, nextTick, ref, watch } from 'vue';
import type { OnCreate } from 'naive-ui/es/dynamic-tags/src/interface';
import { isNull } from '@/utils/common';
import { fetchUpdatePodsLabels } from '@/service/api/dashboard';

interface Props {
  id?: string | number;
  labels: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'submitted'): void }>();

const inputValue = ref<string | null>(null);

const parsedLabels = computed<Record<string, string>>(() => {
  try {
    return JSON.parse(props.labels || '{}');
  } catch {
    return {};
  }
});

const entries = computed(() => Object.entries(parsedLabels.value).filter(([k]) => k !== 'state'));

const [firstEntry, restEntries] = (() => {
  const first = computed(() => entries.value[0]);
  const rest = computed(() => entries.value.slice(1));
  return [first, rest];
})();

const getType = (key: string, value: string): 'info' | 'error' | 'success' => {
  if (key === 'env') return value === 'prod' ? 'error' : 'info';
  if (key === 'name') return 'success';
  return 'info';
};

const updateLabels = async (newLabels: Record<string, string>) => {
  if (!props.id) return;
  const { error } = await fetchUpdatePodsLabels({
    id: String(props.id),
    labels: JSON.stringify(newLabels)
  });
  if (error) {
    window.$message?.error(error.message);
    return;
  }
  inputValue.value = null;
  emit('submitted');
};

const parseLabelStr = (label: string): [string, string] | null => {
  const [key, value] = label.split(':').map(s => s.trim());
  return key && value ? [key, value] : null;
};

const handleCreate: OnCreate = label => {
  if (label.length !== 2 || isNull(label[0]) || isNull(label[1])) {
    window.$message?.error('请输入 "key:value" 格式的标签');
    return label;
  }
  const [key, value] = label;
  const updated = { ...parsedLabels.value, [key]: value };
  updateLabels(updated);
  inputValue.value = null;
  return label;
};

const handleUpdateMain = () => {
  // 第一个标签被删除，仅保留 restEntries
  const newLabels: Record<string, string> = {};
  restEntries.value.forEach(([k, v]) => {
    newLabels[k] = v;
  });
  updateLabels(newLabels);
};

const handleUpdateRest = (values: string[]) => {
  const updated: Record<string, string> = {};
  if (firstEntry.value) {
    const [k, v] = firstEntry.value;
    updated[k] = v;
  }
  values.forEach(str => {
    const pair = parseLabelStr(str);
    if (pair) {
      const [k, v] = pair;
      updated[k] = v;
    }
  });

  updateLabels(updated);
};

const inputRef = ref<InstanceType<typeof NInput>>();

const handleInputConfirm = () => {
  if (inputValue.value && inputValue.value.length === 2) {
    handleCreate(inputValue.value);
  }
};
watch(inputRef, value => {
  if (value) nextTick(() => value.focus());
});
</script>

<template>
  <div class="flex items-center">
    <template v-if="entries.length">
      <!-- 主标签 -->
      <NDynamicTags
        class="mr-2"
        :value="[`${firstEntry[0]}:${firstEntry[1]}`]"
        :type="getType(firstEntry[0], firstEntry[1])"
        @create="handleCreate"
        @update:value="handleUpdateMain"
      >
        <template #trigger="{ activate }">
          <NButton v-if="firstEntry && !restEntries.length" size="small" dashed @click="activate">+</NButton>
        </template>

        <template #input="{ deactivate }">
          <NInput
            ref="inputRef"
            v-model:value="inputValue"
            size="small"
            pair
            separator=":"
            :placeholder="['key', 'value']"
            @blur="
              () => {
                deactivate?.();
                handleInputConfirm();
              }
            "
            @keydown.enter.prevent="
              deactivate?.();
              handleInputConfirm();
            "
          />
        </template>
      </NDynamicTags>

      <!-- 其余标签 -->
      <NPopover v-if="restEntries.length" trigger="click">
        <template #trigger>
          <NTag>+{{ restEntries.length }}</NTag>
        </template>
        <NDynamicTags
          :value="restEntries.map(([k, v]) => `${k}:${v}`)"
          type="info"
          @create="handleCreate"
          @update:value="handleUpdateRest"
        >
          <template #input="{ deactivate }">
            <NInput
              ref="inputRef"
              v-model:value="inputValue"
              size="small"
              pair
              separator=":"
              :placeholder="['key', 'value']"
              @blur="
                () => {
                  deactivate?.();
                  handleInputConfirm();
                }
              "
              @keydown.enter.prevent="
                deactivate?.();
                handleInputConfirm();
              "
            />
          </template>
        </NDynamicTags>
      </NPopover>
    </template>

    <!-- 无标签情况 -->
    <NDynamicTags v-else type="info" @create="handleCreate" @update:value="handleUpdateRest">
      <template #input="{ deactivate }">
        <NInput
          ref="inputRef"
          v-model:value="inputValue"
          size="small"
          pair
          separator=":"
          :placeholder="['key', 'value']"
          @blur="
            () => {
              deactivate?.();
              handleInputConfirm();
            }
          "
          @keydown.enter.prevent="
            deactivate?.();
            handleInputConfirm();
          "
        />
      </template>
    </NDynamicTags>
  </div>
</template>

<style scoped></style>
