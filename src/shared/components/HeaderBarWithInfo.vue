<template>
  <div class="header-bar">
    <div @click="navigateBack" class="return-button">
      <q-img :src="ArrowIcon" />
    </div>
    <div class="logo">
      <img :src="logo" alt="Logo" />
      <div class="logo-text"><span class="bold-text">Rota</span>Financeira</div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ArrowIcon } from '../assets/icons';
import logo from '@/shared/assets/logos/logo.svg';

const router = useRouter();

const navigateBack = () => {
  router.push('/');
};
</script>

<style scoped>
.header-bar {
  display: flex;
  align-items: center;
  margin-top: 24px;
  padding: 6px 20px;
}

.return-button {
  width: 24px;
  height: 24px;
  cursor: pointer;
  margin-right: 65px; /* Added margin to adjust distance */
  transform: rotate(-90deg);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  /* left: 85px;  */
}

.logo img {
  width: 19.734px;
  height: 18px;
  flex-shrink: 0;
  fill: var(--Cores-Primria-200, #8ce95f);
}

.logo-text {
  display: flex;
  align-items: center;
  width: 128.344px;
  height: 13.558px;
  flex-shrink: 0;
  color: var(--Cores-Primria-800, #245017);
  font-size: 18.346px;
  font-style: italic;
  font-weight: 400;
  line-height: 13.76px;
  letter-spacing: -0.202px;
}

.bold-text {
  font-weight: 700;
}
</style>
