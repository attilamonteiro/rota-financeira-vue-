<script setup lang="ts">
import { BatteryIcon } from '@/shared/assets/icons';
import { Notification } from '@/pages/Notifications/types';

defineProps<Notification>();
</script>

<template>
  <div
    :class="[
      'notification',
      {
        'is-danger': status === 'danger',
        'is-warning': status === 'warning',
      },
    ]"
  >
    <div class="notification__icon">
      <img :src="BatteryIcon" alt="" />
    </div>
    <p class="notification__message">{{ message }}</p>
  </div>
</template>

<style scoped lang="scss">
.notification {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #ffffff;
  padding: 0.625rem;
  border-radius: 0 0 8px 8px;
  position: relative;
  overflow: hidden;
  border-top: 4px solid #3e9c14;

  &__icon {
    display: grid;
    place-items: center;
    background-color: #eff3f5;
    padding: 0.3125rem;
    border-radius: 0.5rem;
    flex-shrink: 0;

    img {
      --size: 28px;

      width: 28px;
      height: 28px;
    }
  }

  &__message {
    font-size: 0.875rem;
    color: #2b5e16;
  }

  &.is-danger {
    border-color: #db3d46;
  }

  &.is-warning {
    border-color: #ffc13a;
  }
}
</style>
