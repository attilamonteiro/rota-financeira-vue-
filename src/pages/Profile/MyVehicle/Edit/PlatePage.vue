<template>
  <EditField
    title="Placa"
    description="Digite a placa correta em Placa Atual e clique em salvar alterações."
    :updateValue="updatePlate"
  >
    <label class="edit__label disabled">
      Placa anterior
      <input
        class="edit__input disabled"
        type="text"
        :value="currentCar.license_plate || '---'"
        disabled
      />
    </label>
    <label class="edit__label">
      Placa atual
      <div class="input-wrapper">
        <input class="edit__input" type="text" v-model="plate" />
      </div>
    </label>
  </EditField>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import EditField from '@/pages/Profile/components/EditField.vue';
import { useCarStore } from '@/stores/carStore';

const carStore = useCarStore();
const router = useRouter();

const currentCar = computed(() => carStore.car || carStore.cars[0] || {});
const plate = ref('');

async function updatePlate() {
  // NOTE: a placa é imutável no backend novo (não está no UpdateCarDto) → o
  // updateCar ignora `license_plate`; este save é no-op. Editar placa deveria
  // ser removido/desabilitado da UI.
  if (!plate.value || !currentCar.value.id) return;
  try {
    await carStore.updateCar(currentCar.value.id, { license_plate: plate.value });
    router.back();
  } catch (e) {
    console.error('Update failed', e);
  }
}
</script>
