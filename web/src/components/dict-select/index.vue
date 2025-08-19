<template>
  <a-select :options="options"></a-select>
</template>
<script setup lang="ts">
import {getBasicStore} from "@/modules/basic/store";

const props = defineProps<{
  type: string
}>()
const basicStore = getBasicStore()
const options = basicStore.getDictOptions(props.type)

</script>
