<template>
  <div class="tool-item">
    <div class="star" @click.stop="emit('toggleStar')">
      <icon-star-fill v-if="star"/>
      <icon-star v-else/>
    </div>
    <div class="tool-item-icon">
      <img alt="" :src="icon || '/img/icon/Tools.svg'"/>
    </div>
    <a-tooltip :content="name" position="bottom">
      <div class="tool-item-name">
        {{ name }}
      </div>
    </a-tooltip>
  </div>
</template>
<script setup lang="ts">
const emit = defineEmits(['toggleStar'])
defineProps<{
  name: string
  icon?: string
  star?: string
}>()
</script>
<style scoped lang="less">
.tool-item {
  position: relative;
  user-select: none;
  padding: 10px;
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;

  &:hover {
    background-color: #f5f5f5;

    .star {
      opacity: 1;
    }
  }

  &:active {
    background-color: #f9f9f9;
  }

  > .tool-item-icon {
    flex: 1;
    width: 100%;
    overflow: hidden;
    text-align: center;

    img {
      max-height: 100%;
      max-width: 100%;
    }
  }

  > .tool-item-name {
    height: 20px;
    line-height: 20px;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .star {
    opacity: 0;
    z-index: 1;
    position: absolute;
    right: 4px;
    top: 0;
    font-size: 16px;
    transition: all .3s;
    color: #D5B778;

    &:hover {
      font-size: 20px;
    }
  }
}
</style>
