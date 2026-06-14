<template>
  <EditField
    title="Ano"
    description="Digite o ano completo correto em Ano Atual e clique em salvar alterações."
    :updateValue="updateYear"
  >
    <label class="edit__label disabled">
      Ano anterior
      <input class="edit__input disabled" type="text" :value="currentCar.year || '---'" disabled />
    </label>
    <label class="edit__label">
      Ano atual
      <div class="input-wrapper">
        <input class="edit__input" type="text" v-model="year" />
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
const year = ref('');

async function updateYear() {
  if (!year.value || !currentCar.value.id) return;
  try {
    const yearNumber = parseInt(year.value, 10);
    if (!isNaN(yearNumber)) {
      await carStore.updateCar(currentCar.value.id, { year: yearNumber });
      router.back();
    }
  } catch (e) {
    console.error('Update failed', e);
  }
}
</script>
