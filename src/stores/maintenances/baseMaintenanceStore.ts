/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref, computed } from 'vue';
import { api } from '@/boot/axios';
import { AxiosError } from 'axios';
import { useCarStore } from '../carStore';
import { MAINTENANCE_TYPE_TO_BACKEND } from '@/constants/maintenances';

const baseApi = import.meta.env.VITE_ROTA_API;

// Campos que o backend expõe no topo do DTO (mesmo nome dos dois lados).
const TOP_LEVEL_KEYS = [
  'lastMaintenanceDate',
  'lastMaintenanceKm',
  'nextMaintenanceMileage',
  'nextMaintenanceDate',
  'usedReserve',
  'filterCondition',
  'notes',
  'alignmentPerformed',
];

// payload do form (valor/oficina/campos por tipo) → body do backend
// (value/machineShop/details). carId só no create.
function toBackendBody(payload: any, carId?: string) {
  const body: Record<string, any> = {};
  const details: Record<string, any> = {};

  for (const [key, value] of Object.entries(payload ?? {})) {
    if (value === undefined) continue;
    if (key === 'valor') body.value = value;
    else if (key === 'oficina') body.machineShop = value;
    else if (TOP_LEVEL_KEYS.includes(key)) body[key] = value;
    else details[key] = value; // campos específicos por tipo (oilType, voltage, ...)
  }

  if (Object.keys(details).length) body.details = details;
  if (carId) body.carId = carId;
  return body;
}

// item do backend (value/machineShop/details) → shape lido pelos forms
// (valor/oficina + campos por tipo no topo).
function toFrontendMaintenance(raw: any) {
  const { value, machineShop, details, ...rest } = raw ?? {};
  return {
    ...rest,
    valor: value,
    oficina: machineShop,
    ...(details ?? {}),
  };
}

export function createMaintenanceBase<TMaintenance, TPayload>(options: {
  type: string;
}) {
  const carStore = useCarStore();
  const date = ref<string>('');
  const mileage = ref<string>('');
  const isLoading = ref<boolean>(false);
  const oficina = ref<string>('');

  const maintenances = ref<TMaintenance[]>([]);
  const selectedMaintenance = ref<TMaintenance | null>(null);

  const backendType = MAINTENANCE_TYPE_TO_BACKEND[options.type] ?? options.type;

  // carId resolvido do carStore (no fluxo de manutenção em geral só `cars` está
  // carregado, não `car`).
  function resolveCarId(): string | undefined {
    return carStore.car?.id ?? carStore.cars[0]?.id;
  }

  const isOverdue = computed<boolean>(() => {
    if (!lastMaintenance.value) return false;
    return (lastMaintenance.value as any)?.status === 'EXPIRED';
  });

  const isEditing = computed(() => !!selectedMaintenance.value);
  const getEditingId = computed(() => selectedMaintenance.value?.id);

  function resetBaseState() {
    date.value = '';
    mileage.value = '';
    isLoading.value = false;
    oficina.value = '';
    maintenances.value = [];
    selectedMaintenance.value = null;
  }

  function setSelectedMaintenance(m: TMaintenance | null) {
    selectedMaintenance.value = m;
  }

  const nextPlannedKm = computed<number | null>(() => {
    return lastMaintenance.value?.nextMaintenanceMileage
      ? Number(lastMaintenance.value.nextMaintenanceMileage)
      : null;
  });

  const currentCarMileage = computed<number | null>(() => {
    return (
      carStore.car?.current_mileage ?? carStore.cars[0]?.current_mileage ?? null
    );
  });

  const nextMaintenanceKm = computed<number | null>(() => {
    if (nextPlannedKm.value === null || currentCarMileage.value === null) {
      return null;
    }

    return nextPlannedKm.value - currentCarMileage.value;
  });

  const lastMaintenance = computed<any | null>(() => {
    if (!maintenances.value.length) return null;

    return [...maintenances.value].sort(
      (a: any, b: any) =>
        new Date(b.lastMaintenanceDate).getTime() -
        new Date(a.lastMaintenanceDate).getTime()
    )[0];
  });

  // Backend retorna a lista completa do carro por ID; filtramos pelo tipo.
  // (param mantido por compatibilidade com os callers que passam a placa.)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function getMaintenances(_licensePlate?: string) {
    isLoading.value = true;
    try {
      const carId = resolveCarId();
      if (!carId) {
        maintenances.value = [];
        return maintenances.value;
      }

      const url = `${baseApi}/v1/maintenance/car/${carId}`;
      const { data } = await api().get(url);

      const list = Array.isArray(data) ? data : [];
      maintenances.value = list
        .filter((m: any) => m.type === backendType)
        .map(toFrontendMaintenance) as TMaintenance[];

      return maintenances.value;
    } catch (err) {
      const error = err as AxiosError;
      console.error(error.response ?? error);
    } finally {
      isLoading.value = false;
    }
  }

  async function saveMaintenance(payload: TPayload, maintenanceId?: string) {
    isLoading.value = true;
    try {
      const carId = resolveCarId();
      if (!carId) {
        throw new Error('Nenhum carro selecionado.');
      }

      if (maintenanceId) {
        // PATCH /maintenance/:id (sem tipo, sem /update; carId não vai no body)
        await api().patch(
          `${baseApi}/v1/maintenance/${maintenanceId}`,
          toBackendBody(payload)
        );
      } else {
        // Antes de criar uma nova, marca a anterior como concluída (rota dedicada).
        const last = maintenances.value.at(-1) as any;
        if (last?.id) {
          await api().patch(`${baseApi}/v1/maintenance/${last.id}/complete`);
        }

        // POST /maintenance/:TYPE — carId vai no body.
        await api().post(
          `${baseApi}/v1/maintenance/${backendType}`,
          toBackendBody(payload, carId)
        );
      }
    } finally {
      isLoading.value = false;
    }
  }

  return {
    date,
    mileage,
    isLoading,
    maintenances,
    selectedMaintenance,
    nextMaintenanceKm,
    isOverdue,
    isEditing,
    getEditingId,

    resetBaseState,
    setSelectedMaintenance,
    getMaintenances,
    saveMaintenance,
  };
}
