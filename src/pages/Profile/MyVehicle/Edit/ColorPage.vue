<template>
  <EditField
    title="Cor"
    description="Digite a cor correta em Cor Atual e clique em salvar alterações."
    :updateValue="updateColor"
  >
    <label class="edit__label disabled">
      Cor anterior
      <input class="edit__input disabled" type="text" :value="currentCar.color || '---'" disabled />
    </label>
    <label class="edit__label">
      Cor atual
      <div class="input-wrapper">
        <input class="edit__input" type="text" v-model="color" />
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
const color = ref('');

async function updateColor() {
  if (!color.value || !currentCar.value.id) return;
  try {
    await carStore.updateCar(currentCar.value.id, { color: color.value });
    router.back();
  } catch (e) {
    console.error('Update failed', e);
  }
}
</script>
