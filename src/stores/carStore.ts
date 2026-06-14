/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/boot/axios';
import { Car } from '@/shared/types/car';
const baseApi = import.meta.env.VITE_ROTA_API;

export type CarRegisterPayload = {
  userId?: string;
  chassis: string;
  brand?: string;
  model: string;
  license_plate: string;
  year: number;
  color: string;
  fuelType: string;
  current_mileage: number;
};

export type CarUpdatePayload = {
  userId?: string;
  chassis?: string;
  brand?: string;
  model?: string;
  license_plate?: string;
  year?: number;
  color?: string;
  fuel_type?: string;
  current_mileage?: number;
};

// O backend valida fuelType contra um enum UPPER_SNAKE; o formulário envia
// rótulos em PT. Mapeamos; se já vier um valor do enum, passa direto.
const FUEL_TYPE_MAP: Record<string, string> = {
  Gasolina: 'GASOLINE',
  Etanol: 'ETHANOL',
  Elétrico: 'ELECTRIC',
  Diesel: 'DIESEL',
  Flex: 'FLEX',
};
function mapFuelType(value?: string): string | undefined {
  if (!value) return undefined;
  return FUEL_TYPE_MAP[value] ?? value;
}

// Adaptador: o backend devolve camelCase (licensePlate, currentMileage). Várias
// telas/stores (financialStore, baseMaintenanceStore, HomePage, FinancesPage,
// Edit pages) leem license_plate/current_mileage. Mantemos esse shape no front.
function toFrontendCar(raw: any): Car {
  return {
    ...raw,
    license_plate: raw?.licensePlate ?? raw?.license_plate,
    current_mileage: raw?.currentMileage ?? raw?.current_mileage,
  } as Car;
}

export const useCarStore = defineStore('car', () => {
  const cars = ref<Car[]>([]);
  const car = ref<Car | null>(null);
  const error = ref<any | null>(null);
  const isLoading = ref(false);
  const firstLicensePlate = ref<string | null>(null);

  async function registerCar(payload: CarRegisterPayload) {
    isLoading.value = true;
    error.value = null;

    try {
      // RegisterCarDto (camelCase). userId vem do token no backend.
      const body = {
        year: payload.year,
        model: payload.model,
        licensePlate: payload.license_plate,
        currentMileage: payload.current_mileage,
        chassis: payload.chassis,
        color: payload.color,
        brand: payload.brand,
        fuelType: mapFuelType(payload.fuelType),
      };

      await api().post(`${baseApi}/v1/car`, body);
      // POST retorna 201 com body vazio → recarrega a lista para refletir o carro.
      await getCars();

      return car.value;
    } catch (e: any) {
      const errData = e.response?.data || e;
      error.value = errData;

      if (e.response?.status === 409) {
        throw new Error('Um carro com essa placa já está registrado.');
      }
      if (e.response?.status === 400) {
        throw new Error('Dados inválidos. Verifique os campos.');
      }

      throw errData;
    } finally {
      isLoading.value = false;
    }
  }

  async function getCars() {
    isLoading.value = true;
    error.value = null;

    try {
      const { data } = await api().get<any[]>(`${baseApi}/v1/car`);

      cars.value = (data ?? []).map(toFrontendCar);
      firstLicensePlate.value = cars.value[0]?.license_plate ?? null;

      return cars.value;
    } catch (e: any) {
      error.value = e.response?.data || e;
      throw error.value;
    } finally {
      isLoading.value = false;
    }
  }

  async function getCarByPlate(license_plate: string) {
    isLoading.value = true;
    error.value = null;
    try {
      const { data } = await api().get(
        `${baseApi}/v1/car/plate/${license_plate}`
      );
      car.value = toFrontendCar(data);

      return car.value;
    } catch (e: unknown) {
      const err = e as any;
      error.value = err.response?.data || err;
      throw error.value;
    } finally {
      isLoading.value = false;
    }
  }

  // Atualização agora é por ID do carro (UUID), não pela placa.
  async function updateCar(id: string, payload: CarUpdatePayload) {
    isLoading.value = true;
    error.value = null;
    try {
      // UpdateCarDto aceita só estes campos (camelCase). Placa e quilometragem
      // NÃO são editáveis por esta rota (campos não suportados são ignorados).
      const body: Record<string, unknown> = {};
      if (payload.year !== undefined) body.year = payload.year;
      if (payload.model !== undefined) body.model = payload.model;
      if (payload.chassis !== undefined) body.chassis = payload.chassis;
      if (payload.color !== undefined) body.color = payload.color;
      if (payload.brand !== undefined) body.brand = payload.brand;
      const fuel = mapFuelType(payload.fuel_type);
      if (fuel !== undefined) body.fuelType = fuel;

      const { data } = await api().patch(`${baseApi}/v1/car/${id}`, body);
      car.value = toFrontendCar(data);
      return car.value;
    } catch (e: unknown) {
      const err = e as any;
      error.value = err.response?.data || err;
      throw error.value;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateCarMileage(id: string, current_mileage: number) {
    isLoading.value = true;
    error.value = null;
    try {
      const { data } = await api().patch(`${baseApi}/v1/car/${id}/mileage`, {
        currentMileage: current_mileage,
      });
      car.value = toFrontendCar(data);
      return car.value;
    } catch (e: unknown) {
      const err = e as any;
      error.value = err.response?.data || err;
      throw error.value;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    cars,
    car,
    error,
    isLoading,
    firstLicensePlate,
    registerCar,
    getCars,
    getCarByPlate,
    updateCar,
    updateCarMileage,
  };
});
