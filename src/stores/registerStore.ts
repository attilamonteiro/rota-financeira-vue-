/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia';
import { api } from '@/boot/axios';

const baseApi = import.meta.env.VITE_ROTA_API;

export const useRegisterStore = defineStore('register', {
  state: () => ({
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    name: '',
    lastName: '',
    day: '',
    month: '',
    year: '',
    phone: '',
    userProfile: null as any,
  }),
  actions: {
    async fetchProfile() {
      try {
        const { data } = await api().get(`${baseApi}/v1/user/me`);
        this.userProfile = data;
        return data;
      } catch (e: any) {
        throw e.response?.data || e;
      }
    },
    async checkEmail(email: string) {
      try {
        const { data } = await api().get(`${baseApi}/v1/user/check-email`, {
          params: { email },
        });
        return data as { exists: boolean };
      } catch (e: any) {
        throw e.response?.data || e;
      }
    },

    async registerUser(payload: {
      name: string;
      lastName: string;
      birthday: string;
      email: string;
      phone: string;
      password: string;
    }) {
      try {
        const { data } = await api().post(`${baseApi}/v1/user`, payload);
        return data;
      } catch (e: any) {
        throw e.response?.data || e;
      }
    },

    async login(payload: { email: string; password: string }) {
      try {
        // Sucesso = HTTP 200. O backend entrega o token via cookie httpOnly
        // (Set-Cookie); não há token no body para guardar.
        await api().post(`${baseApi}/v1/auth/login`, payload);
      } catch (e: any) {
        throw e.response?.data || e;
      }
    },

    googleLogin() {
      // Redirect de página inteira para o fluxo OAuth do backend.
      // O retorno cai na rota SPA 'google-callback' já com o cookie de sessão.
      const url = `${baseApi}/v1/auth/google`;
      window.location.href = url;
    },

    async updateUser(payload: {
      name?: string;
      lastName?: string;
      birthday?: string;
      email?: string;
      phone?: string;
      currentPassword?: string;
      newPassword?: string;
    }) {
      try {
        const { data } = await api().patch(`${baseApi}/v1/user`, payload);
        await this.fetchProfile();
        return data;
      } catch (e: any) {
        throw e.response?.data || e;
      }
    },
    setEmail(email: string) {
      this.email = email;
    },
    setConfirmEmail(confirmEmail: string) {
      this.confirmEmail = confirmEmail;
    },
    setPassword(password: string) {
      this.password = password;
    },
    setConfirmPassword(confirmPassword: string) {
      this.confirmPassword = confirmPassword;
    },
    setName(name: string) {
      this.name = name;
    },
    setLastName(lastName: string) {
      this.lastName = lastName;
    },
    setDay(day: string) {
      this.day = day;
    },
    setMonth(month: string) {
      this.month = month;
    },
    setYear(year: string) {
      this.year = year;
    },
    setPhone(phone: string) {
      this.phone = phone;
    },
    resetStore() {
      this.email = '';
      this.confirmEmail = '';
      this.password = '';
      this.confirmPassword = '';
      this.name = '';
      this.lastName = '';
      this.day = '';
      this.month = '';
      this.year = '';
      this.phone = '';
    },
  },
});
