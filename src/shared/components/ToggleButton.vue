<template>
  <div class="custom-toggle" @click="toggle">
    <img :src="modelValue ? toggleOn : toggleOff" class="toggle-icon" />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import toggleOn from '@/shared/assets/toggle-on.svg';
import toggleOff from '@/shared/assets/toggle-off.svg';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

function toggle() {
  emit('update:modelValue', !props.modelValue);
}
</script>

<style scoped>
.custom-toggle {
  cursor: pointer;
  user-select: none;
}

.toggle-icon {
  width: 24px;
  height: 24px;
}
</style>
