<template>
  <EditField
    title="Marca"
    description="Digite a marca completa correta em Marca Atual e clique em salvar alterações."
    :updateValue="updateBrand"
  >
    <label class="edit__label disabled">
      Marca anterior
      <input class="edit__input disabled" type="text" :value="currentCar.brand || '---'" disabled />
    </label>
    <label class="edit__label">
      Marca atual
      <div class="input-wrapper">
        <input class="edit__input" type="text" v-model="brand" />
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
const brand = ref('');

async function updateBrand() {
  if (!brand.value || !currentCar.value.id) return;
  try {
    await carStore.updateCar(currentCar.value.id, { brand: brand.value });
    router.back();
  } catch (e) {
    console.error('Update failed', e);
  }
}
</script>
