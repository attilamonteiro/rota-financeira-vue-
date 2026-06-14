<template>
  <div class="app-wrapper">
    <header class="history__header">
      <div class="flex">
        <img :src="PageIcon" alt="" />
        <h1 class="history__title">Histórico</h1>
      </div>
      <button class="history__settings">
        <img :src="FilterControlsIcon" alt="" />
      </button>
    </header>
    <main class="history__main">
      <div v-if="isLoading" class="spinner-center">
        <q-spinner color="primary" size="40px" />
      </div>
      <section
        class="history__no-maintenances"
        v-else-if="!isLoading && isThereNoMaintenances"
      >
        <img :src="BrokenCar" alt="" />
        <p class="">Você ainda não possui manutenções cadastradas!</p>
      </section>
      <HistoryCard
        v-else
        v-for="history in maintenanceHistory"
        v-bind="history"
        :key="history.id"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { FilterControlsIcon, PageIcon } from '@/shared/assets/icons';
import HistoryCard from './components/HistoryCard.vue';
import { HistoryCardProps } from './types';
import { BrokenCar } from '@/shared/assets/illustrations';

import { onMounted, ref, watch } from 'vue';
import { QSpinner } from 'quasar';
import { useMaintenanceStore } from '@/stores/maintenance';
import { useCarStore } from '@/stores/carStore';

const types = ['OIL', 'BATTERY', 'AIR_FILTER', 'FUEL_FILTER', 'WHEEL_ALIGNMENT'];
const maintenanceStore = useMaintenanceStore();
const carStore = useCarStore();
const maintenanceHistory = ref<HistoryCardProps[]>([]);
const isLoading = ref(false);

const typeLabels: Record<string, string> = {
  OIL: 'Troca de óleo',
  FUEL_FILTER: 'Troca do filtro de combustível',
  WHEEL_ALIGNMENT: 'Alinhamento e balanceamento',
  BATTERY: 'Troca de bateria',
  AIR_FILTER: 'Troca do filtro de ar',
  WHEEL: 'Troca de roda',
};

const typeIcons: Record<string, HistoryCardProps['maintenances'][number]['icon']> = {
  OIL: 'oil',
  FUEL_FILTER: 'fuelFilter',
  WHEEL_ALIGNMENT: 'alignment',
  BATTERY: 'battery',
  AIR_FILTER: 'airFilter',
  WHEEL: 'wheel',
};

// Registro achatado de GET /maintenance/car/:carId (contrato novo).
type MaintenanceApiItem = {
  id: string;
  type: string; // enum do backend (UPPER_SNAKE)
  lastMaintenanceDate?: string;
  lastMaintenanceKm?: number;
  value?: number;
  machineShop?: string;
  status?: string;
};

function mapApiToHistoryCard(item: MaintenanceApiItem): HistoryCardProps {
  const formattedValue =
    item.value != null
      ? new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(Number(item.value))
      : '-';

  const icon = typeIcons[item.type] ?? 'oil';

  let month = '';
  let date = '-';
  if (item.lastMaintenanceDate) {
    const d = new Date(item.lastMaintenanceDate);
    month = d.toLocaleString('pt-BR', { month: 'long' });
    date = d.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  return {
    id: item.id,
    month,
    date,
    km: item.lastMaintenanceKm?.toString() || '-',
    maintenances: [
      {
        icon,
        title: typeLabels[item.type] ?? item.type,
        description: formattedValue,
      },
    ],
  };
}

onMounted(async () => {
  await carStore.getCars();
});

watch(
  () => carStore.firstLicensePlate,
  async (plate) => {
    if (plate) {
      isLoading.value = true;
      await maintenanceStore.getMaintenanceHistory(plate, types);
      const records = (
        maintenanceStore.history as unknown as MaintenanceApiItem[]
      )
        .slice()
        .sort(
          (a, b) =>
            new Date(b.lastMaintenanceDate ?? 0).getTime() -
            new Date(a.lastMaintenanceDate ?? 0).getTime()
        );
      maintenanceHistory.value = records.map(mapApiToHistoryCard);
      isLoading.value = false;
    }
  },
  { immediate: true }
);

const isThereNoMaintenances = ref(false);
watch(maintenanceHistory, (val) => {
  isThereNoMaintenances.value = Array.isArray(val) && val.length === 0;
});
</script>

<style scoped lang="scss">
.history {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: normal;
    margin: 0;
  }

  &__settings {
    display: block;
    height: 20px;
    background: none;
    border: none;
    padding: 0;
  }

  &__main {
    display: grid;
    align-items: start;
    gap: 1.5rem;
    min-height: calc(100svh - 219px);
  }

  &__no-maintenances {
    display: grid;
    place-items: center;
    gap: 1.5rem;

    p {
      font-size: 1.125rem;
      font-weight: 500;
      text-align: center;
      max-width: 15rem;
    }
  }
}

.flex {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.spinner-center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}
</style>
