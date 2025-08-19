<template>
  <div v-if="show" class="target-timing">
    <div class="target-year">前往 {{ time.targetYear }} 年</div>
    <div class="target-day">还有 {{ time.remainingDay }} 天</div>
  </div>
</template>
<script setup lang="ts">
import {getBasicStore, getUserStore} from "@/store";
import dayjs from "dayjs";


const userStore = getUserStore()
const basicStore = getBasicStore()
const profile = computed(()=> unref(userStore.profile))
const show = computed(() => profile.value.birth && profile.value.gender)
const time = computed(() => {
  const {birth, gender} = profile.value
  const now = dayjs()
  const year = dayjs(birth).add(basicStore.setting.meanAgeAtDeath[gender], 'year').startOf('year')
  return {
    targetYear: year.year(),
    remainingDay: year.diff(now, 'day')
  }
})
</script>
<style scoped lang="less">
.target-timing {
  background: var(--white-glass);
  position: absolute;
  padding: 1em;
  //border: 1px solid black;
  border-radius: var(--radius);
  right: 1em;
  top: 1em;
  box-shadow: var(--shadow1);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
