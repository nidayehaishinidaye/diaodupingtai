<script setup lang="ts">
import { groupConfigStatusRecord, yesOrNoRecord } from '@/constants/business';
import { $t } from '@/locales';
import { tagColor } from '@/utils/common';

defineOptions({
  name: 'GroupDetailDrawer'
});

interface Props {
  /** row data */
  rowData?: Api.GroupConfig.GroupConfig | null;
}

defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});
</script>

<template>
  <OperateDrawer v-model="visible" :title="$t('page.groupConfig.detail')">
    <NDescriptions label-placement="top" bordered :column="1">
      <NDescriptionsItem :label="$t('page.groupConfig.groupName')" :span="1">
        {{ rowData?.groupName }}
      </NDescriptionsItem>

      <NDescriptionsItem :label="$t('page.groupConfig.token')" :span="1">{{ rowData?.token }}</NDescriptionsItem>
      <NDescriptionsItem :label="$t('page.groupConfig.groupStatus')" :span="1">
        <NTag :type="tagColor(rowData?.groupStatus!)">{{ $t(groupConfigStatusRecord[rowData?.groupStatus!]) }}</NTag>
      </NDescriptionsItem>
      <NDescriptionsItem :label="$t('page.groupConfig.initScene')" :span="1">
        <NTag :type="tagColor(rowData?.initScene!)">{{ $t(yesOrNoRecord[rowData?.initScene!]) }}</NTag>
      </NDescriptionsItem>
      <NDescriptionsItem :label="$t('page.groupConfig.description')" :span="1">
        {{ rowData?.description }}
      </NDescriptionsItem>
    </NDescriptions>
  </OperateDrawer>
</template>

<style scoped></style>
