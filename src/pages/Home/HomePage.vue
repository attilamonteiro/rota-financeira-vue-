<template>
  <LoadingPage v-if="isLoading" />

  <div v-else class="home">
    <div class="home__header">
      <div class="card">
        <div class="card__header">
          <span class="card__header-title">Como está seu odômetro hoje?</span>
          <div @click="showHelpModal">
            <img :src="helpIcon" alt="Help Icon" />
          </div>
        </div>

        <div class="card__info">
          <p class="current-km">{{ currentMileage ?? '000.000' }}</p>
          <span class="km-text">KM</span>
        </div>

        <div>
          <span class="last-km">
            Último registro: <br />
            <span class="last-km__date">{{ lastMaintenanceDate }}</span>
          </span>
        </div>

        <div class="odometer__icon">
          <img :src="odometer" alt="Odometer Icon" />
        </div>
      </div>

      <CButton
        variant="primary"
        :disabled="!hasCarRegistered"
        label="Inserir quilometragem do dia"
        :isLoading="isSendingMileage"
        @click="openMileageModal"
      />
    </div>

    <div v-if="!hasCarRegistered" class="home__content">
      <div class="alertCard">
        <img :src="CarIcon" />
        <h2 class="alertCard__title">Veículo não cadastrado</h2>
        <span class="alertCard__text">
          Cadastre seu veículo para acompanhar manutenções e gastos.
        </span>
      </div>
      <CButton variant="primary" :to="{ name: 'user-vehicle-register' }">
        Cadastrar veículo
      </CButton>
    </div>

    <div
      v-else-if="hasCarRegistered && maintenanceSummary.hasMaintenances"
      class="maintenance-summary"
    >
      <SummaryCard
        v-if="maintenanceSummary.expired.length > 0"
        :value="maintenanceSummary.expiredCount"
        :maintenances="
          maintenanceStore.mapToCardMaintenances(maintenanceSummary.expired)
        "
        variant="expired"
      />

      <SummaryCard
        v-if="maintenanceSummary.pending.length > 0"
        title=""
        :value="maintenanceSummary.pendingCount"
        :maintenances="
          maintenanceStore.mapToCardMaintenances(maintenanceSummary.pending)
        "
        variant="pending"
      />
    </div>

    <div v-else class="home__content">
      <div class="alertCard">
        <img :src="CarIcon" />
        <h2 class="alertCard__title">Manutenções não cadastradas</h2>
        <span class="alertCard__text">
          Mantenha um registro das manutenções que você já fez para saber quando
          é a hora de agendar as próximas revisões.
        </span>
      </div>
      <CButton variant="primary" :to="{ name: 'maintenances' }">
        Cadastrar manutenções
      </CButton>
    </div>
  </div>

  <CModal v-model="isOpen" variant="info">
    <h2>Como funciona o odômetro?</h2>

    <p>
      O odômetro é onde você registra a <strong>quilometragem atual</strong> do
      seu veículo <strong>diariamente.</strong> Esses dados são essenciais para
      que o app calcule quando cada manutenção precisa ser feita ou se alguma já
      está vencida.
    </p>
    <ul>
      <li>
        Preencha no final do dia com o valor que aparece no painel do seu carro.
      </li>
    </ul>

    <p>
      Quanto mais <strong>regular</strong> for esse registro, mais
      <strong>precisas</strong> serão as previsões de manutenção.
    </p>
  </CModal>

  <CModalWithButton
    v-model="isMileageModalOpen"
    title="Como está seu odômetro hoje?"
    buttonLabel="Salvar"
    @confirm="onSubmit"
    :disabled="!!errors.mileage"
  >
    <p>Preencha com o valor que aparece no painel do seu carro.</p>
    <CInput
      v-model="mileage"
      name="mileage"
      variant="unit"
      placeholder="Ex.: 100.090"
      required
      maxlength="7"
    />
  </CModalWithButton>

  <CModal
    v-model="isSuccessModalOpen"
    variant="default"
    showClose
    icon="success"
  >
    <div class="group">
      <h2>Quilometragem atualizada!</h2>
      <p>A nova quilometragem do seu odômetro foi salva com sucesso.</p>
    </div>
  </CModal>

  <CBottomSheetText v-model="isVehicleBottomSheetOpen" :showClose="true">
    <img :src="Car" />
    <div class="group">
      <h2>Que bom ter você por aqui!</h2>
      <p>
        Vamos cuidar do seu carro juntos! Comece cadastrando seu veículo para
        acompanhar suas manutenções e gastos.
      </p>
    </div>
    <CButton variant="secondary" :to="{ name: 'user-vehicle-register' }">
      Cadastrar veículo
    </CButton>
  </CBottomSheetText>

  <CBottomSheetText v-model="isMaintenanceBottomSheetOpen" :showClose="true">
    <img :src="CarRepair" />
    <div class="group">
      <h2>Registre e planeje suas manutenções em um só lugar</h2>
      <p>
        Cadastre os serviços realizados e acompanhe as próximas revisões para
        evitar gastos inesperados.
      </p>
    </div>
    <CButton variant="secondary" :to="{ name: 'maintenances' }">
      Cadastrar manutenções
    </CButton>
  </CBottomSheetText>
</template>

<script setup lang="ts">
import helpIcon from '@/shared/assets/helpIcon.svg';
import LoadingPage from '../LoadingPage.vue';
import odometer from '@/shared/assets/illustrations/odometer.svg';
import { ref, computed, onMounted } from 'vue';
import { useCarStore } from '@/stores/carStore';
import CModal from '@/shared/components/CModal.vue';
import CInput from '@/shared/components/CInput.vue';
import * as yup from 'yup';
import CModalWithButton from './components/CModalWithButton.vue';
import { CarIcon } from '@/shared/assets/illustrations';
import { useMaintenanceStore } from '@/stores/maintenance';
import { MaintenanceStatus } from '../Maintenances/types';
import CButton from '@/shared/components/CButton.vue';
import { useForm, useField } from 'vee-validate';
import SummaryCard from './components/SummaryCard.vue';
import CBottomSheetText from '@/shared/components/bottomsheets/CBottomSheetText.vue';
import { Car, CarRepair } from '@/shared/assets/illustrations';

const isVehicleBottomSheetOpen = ref(false);
const isMaintenanceBottomSheetOpen = ref(false);

const lastMileage = ref<number | null>(null);

const isLoading = ref(true);

const validationSchema = computed(() =>
  yup.object({
    mileage: yup
      .number()
      .transform((_, originalValue) =>
        Number(String(originalValue).replace(/\./g, '').replace(',', '.'))
      )
      .typeError('Digite um número válido')
      .required('Campo obrigatório')
      .moreThan(
        lastMileage.value ?? 0,
        'Informe um valor maior que a quilometragem atual'
      )
      .max(999999, 'A quilometragem máxima é 999.999'),
  })
);

const { handleSubmit, errors, resetForm } = useForm({
  validationSchema,
});

const parseLocalizedNumber = (value: string) => {
  if (!value) return NaN;
  console.log(value);
  return Number(value.replace(/\./g, '').replace(',', '.'));
};

const { value: mileage } = useField<number | string>('mileage');

const isMileageModalOpen = ref(false);
const isOpen = ref(false);
const isSuccessModalOpen = ref(false);
const isSendingMileage = ref(false);

const carStore = useCarStore();
const maintenanceStore = useMaintenanceStore();

const maintenanceSummary = ref({
  hasMaintenances: false,
  expired: [] as MaintenanceStatus[],
  pending: [] as MaintenanceStatus[],
  expiredCount: 0,
  pendingCount: 0,
});

const lastMaintenanceDate = computed(() => {
  const lastUpdate = carStore.car?.lastMileageUpdate?.date;

  if (!lastUpdate) return '--/--/----';

  return new Date(lastUpdate).toLocaleDateString('pt-BR');
});

const onSubmit = handleSubmit(async (values) => {
  const mileageNumber = parseLocalizedNumber(values.mileage);
  try {
    const currentCar = carStore.car;
    if (currentCar?.id) {
      await carStore.updateCarMileage(currentCar.id, mileageNumber);
      // re-fetch p/ atualizar o display (a leitura por placa continua válida)
      await carStore.getCarByPlate(currentCar.license_plate);
    }

    isMileageModalOpen.value = false;
    isSuccessModalOpen.value = true;
  } catch (err) {
    console.error('Erro ao atualizar quilometragem:', err);
  } finally {
    isSendingMileage.value = false;
  }
});

const hasCarRegistered = computed(() => carStore.cars.length > 0);

const currentMileage = computed(() => {
  const mileage = carStore.car?.current_mileage ?? null;
  return mileage == null ? null : mileage.toLocaleString('pt-BR');
});

onMounted(async () => {
  isLoading.value = true;

  await carStore.getCars();

  if (carStore.firstLicensePlate) {
    await carStore.getCarByPlate(carStore.firstLicensePlate);
    const summary = await maintenanceStore.getMaintenanceSummary(
      carStore.firstLicensePlate
    );
    maintenanceSummary.value = {
      hasMaintenances: !!summary.hasMaintenances,
      expired: summary.expired ?? [],
      pending: summary.pending ?? [],
      expiredCount: summary.expiredCount ?? 0,
      pendingCount: summary.pendingCount ?? 0,
    };

    isVehicleBottomSheetOpen.value = false;
    isMaintenanceBottomSheetOpen.value =
      !maintenanceSummary.value.hasMaintenances;
  } else {
    isVehicleBottomSheetOpen.value = true;
  }

  isLoading.value = false;
});

const openMileageModal = () => {
  if (!hasCarRegistered.value) return;

  lastMileage.value = carStore.car?.current_mileage ?? 0;
  resetForm({
    values: {
      mileage: '',
    },
  });

  isMileageModalOpen.value = true;
};

const showHelpModal = (): void => {
  isOpen.value = true;
};
</script>

<style scoped>
@import './HomePage.scss';
</style>
