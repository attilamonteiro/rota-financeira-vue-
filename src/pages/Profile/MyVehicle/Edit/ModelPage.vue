<template>
  <EditField
    title="Modelo"
    description="Digite o modelo completo correto em Modelo Atual e clique em salvar alterações."
    :updateValue="updateModel"
  >
    <label class="edit__label disabled">
      Modelo anterior
      <input
        class="edit__input disabled"
        type="text"
        :value="currentCar.model || '---'"
        disabled
      />
    </label>
    <label class="edit__label">
      Modelo atual
      <div class="input-wrapper">
        <input class="edit__input" type="text" v-model="model" />
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
const model = ref('');

async function updateModel() {
  if (!model.value || !currentCar.value.id) return;
  try {
    await carStore.updateCar(currentCar.value.id, { model: model.value });
    router.back();
  } catch (e) {
    console.error('Update failed', e);
  }
}
</script>
