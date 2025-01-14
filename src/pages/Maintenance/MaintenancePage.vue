<template>
  <div class="maintenance-page">
    <!-- Header -->
    <AppHeader />

    <div class="maintenance-title">
      <img :src="manuIcon" alt="Manutenções Icon" class="title-icon" />
      <div class="title-text">Manutenções</div>
    </div>

    <!-- Seção: Manutenções vencidas -->
    <q-card class="maintenance-section">
      <div class="section-header expired-header">
        <div class="section-icon">
          <img :src="manuIcon" alt="Expired Icon" class="section-image" />
        </div>
        <div class="section-title">
          <strong>Manutenções vencidas</strong>
        </div>
      </div>
      <div class="maintenance-items">
        <q-card
          v-for="(item, index) in expiredMaintenances"
          :key="`expired-${index}`"
          class="maintenance-item no-shadow"
        >
          <div class="maintenance-content">
            <img :src="item.image" alt="Maintenance Image" class="maintenance-image" />
            <div class="maintenance-details">
              <div class="maintenance-name">
                {{ item.title }}
              </div>
              <div class="maintenance-date">
                {{ item.date }}
              </div>
            </div>
          </div>
          <div class="maintenance-progress">
            {{ item.progress }}
          </div>
        </q-card>
      </div>
    </q-card>

    <!-- Seção: Próximas manutenções -->
    <q-card class="maintenance-section">
      <div class="section-header next-header">
        <div class="section-icon">
          <img :src="manuIcon" alt="Next Icon" class="section-image" />
        </div>
        <div class="section-title">
          <strong>Próximas manutenções</strong>
        </div>
      </div>
      <div class="maintenance-items">
        <q-card
          v-for="(item, index) in nextMaintenances"
          :key="`next-${index}`"
          class="maintenance-item no-shadow"
        >
          <div class="maintenance-content">
            <img :src="item.image" alt="Maintenance Image" class="maintenance-image" />
            <div class="maintenance-details">
              <div class="maintenance-name">
                {{ item.title }}
              </div>
              <div class="maintenance-date">
                {{ item.date }}
              </div>
            </div>
          </div>
          <div class="maintenance-progress">
            {{ item.progress }}
          </div>
        </q-card>
      </div>
    </q-card>

    <div class="separator"></div>

    <!-- Seção: Preencher etapas -->
    <q-card class="maintenance-section">
      <div class="section-header fill-steps-header">
        <div class="section-icon">
          <img :src="manuIcon" alt="Fill Steps Icon" class="section-image" />
        </div>
        <div class="section-title">
          <strong>Preencher etapas</strong>
        </div>
      </div>
      <div class="maintenance-items">
        <q-card
          v-for="(item, index) in fillStepsMaintenances"
          :key="`fillsteps-${index}`"
          class="maintenance-item no-shadow"
        >
          <div class="maintenance-content">
            <img :src="item.image" alt="Maintenance Image" class="maintenance-image" />
            <div class="maintenance-details">
              <div class="maintenance-name">
                {{ item.title }}
              </div>
              <div class="maintenance-date">
                {{ item.date }}
              </div>
            </div>
          </div>
          <div class="maintenance-progress">
            {{ item.progress }}
          </div>
        </q-card>
      </div>
    </q-card>

    <div class="separator"></div>

    <!-- Seção: Concluído -->
    <q-card class="maintenance-section">
      <div class="section-header completed-header">
        <div class="section-icon">
          <img :src="manuIcon" alt="Completed Icon" class="section-image" />
        </div>
        <div class="section-title">
          <strong>Concluído</strong>
        </div>
      </div>
      <div class="maintenance-items">
        <q-card
          v-for="(item, index) in completedMaintenances"
          :key="`completed-${index}`"
          class="maintenance-item no-shadow"
        >
          <div class="maintenance-content">
            <img :src="item.image" alt="Maintenance Image" class="maintenance-image" />
            <div class="maintenance-details">
              <div class="maintenance-name">
                {{ item.title }}
              </div>
              <div class="maintenance-date">
                {{ item.date }}
              </div>
            </div>
          </div>
          <div class="maintenance-progress">
            {{ item.progress }}
          </div>
          <q-separator v-if="index < completedMaintenances.length - 1" />
        </q-card>
      </div>
    </q-card>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import oilImage from '@/assets/agua.svg';
import manuIcon from '@/assets/manu.svg';
// import expiredIcon from '@/assets/expired.svg';
// import nextIcon from '@/assets/next.svg';
// import fillStepsIcon from '@/assets/fill-steps.svg';
// import completedIcon from '@/assets/completed.svg';
// import batteryImage from '@/assets/agua.svg';
// import filterImage from '@/assets/agua.svg';
import alignmentImage from '@/assets/Alinham.svg';
// import airConditionerImage from '@/assets/agua.svg';

interface MaintenanceItem {
  title: string;
  date: string;       // pode ser "Venceu dia X", "Vence dia Y", etc.
  progress: string;   // ex: "6/8"
  image: string;      // caminho da imagem
}

const expiredMaintenances = ref<MaintenanceItem[]>([
  {
    title: 'Alinhamento e balanceamento',
    date: 'Venceu dia 1 out. 2024',
    progress: '6/8',
    image: alignmentImage,
  },
  {
    title: 'Troca de óleo',
    date: 'Venceu dia 1 out. 2024',
    progress: '6/8',
    image: oilImage,
  },
]);

const nextMaintenances = ref<MaintenanceItem[]>([
  {
    title: 'Alinhamento e balanceamento',
    date: 'Vence dia 12 out. 2025',
    progress: '6/8',
    image: alignmentImage,
  },
  {
    title: 'Troca de óleo',
    date: 'Vence dia 1 out. 2025',
    progress: '6/8',
    image: oilImage,
  },
]);

const fillStepsMaintenances = ref<MaintenanceItem[]>([
  {
    title: 'Alinhamento e balanceamento',
    date: '',
    progress: '2/5',
    image: alignmentImage,
  },
  {
    title: 'Troca de óleo',
    date: '',
    progress: '3/5',
    image: oilImage,
  },
]);

const completedMaintenances = ref<MaintenanceItem[]>([
  {
    title: 'Alinhamento e balanceamento',
    date: '',
    progress: ' ',
    image: alignmentImage,
  },
  {
    title: 'Troca de óleo',
    date: '',
    progress: ' ',
    image: oilImage,
  },
]);
</script>

<style scoped>
.maintenance-page {
  max-width: 600px;
  margin: 0 auto;
  background-color: #f9f9f9;
}

.maintenance-title {
  display: flex;
  align-items: center;
  gap: 10px; 
  padding-left: 20px;
  margin: 0 auto;
  margin-bottom: 12px;
  border-top: 100px;

}

.title-icon {
  width: 24px;
  height: 24px;
}

.title-text {
  font-size: 14px;
  margin: 0;
  color: #212121; /* Exemplo de cor preta */
  font-weight: 500;
  font-family: 'Raleway', sans-serif; /* Aplique a fonte Raleway */
}

.maintenance-section {
  background-color: #ffffff; /* Cor de fundo dos cards */
  margin-bottom: 1.5rem;
  border-radius: 8px;
  margin-left: 16px;
  margin-right: 16px;
}

/* Linha separadora */
.separator {
  width: 209px;
  height: 1px;
  background-color: #e0e0e0;
  margin: 0 auto;
}

/* Cabeçalho da seção */
.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.section-icon {
  margin-right: 0.5rem;
}

.section-image {
  width: 24px;
  height: 24px;
}

.expired-header .text-danger {
  color: #e53935; /* Exemplo de cor vermelha */
}
.next-header .text-info {
  color: #2196f3; /* Exemplo de cor azul */
}
.fill-steps-header .text-primary {
  color: #3f51b5; /* Exemplo de cor roxa/primária */
}
.completed-header .text-success {
  color: #4caf50; /* Exemplo de cor verde */
}

/* Itens da manutenção */
.maintenance-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.maintenance-item {
  background-color: #ffffff; /* Cor de fundo dos cards */
  border-radius: 6px;
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.maintenance-item.no-shadow {
  box-shadow: none; /* Remove shadow */
}

.maintenance-content {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.maintenance-image {
  width: 40px;
  height: 40px;
  margin-right: 0.75rem;
}

.maintenance-details {
  display: flex;
  flex-direction: column;
}

.maintenance-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.maintenance-date {
  font-size: 0.9rem;
  color: #666;
}

.maintenance-progress {
  font-weight: 500;
  color: #444;
}
</style>
