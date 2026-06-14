<template>
  <q-page class="flex flex-center">
    <q-spinner size="3em" color="primary" />
    <div class="q-ml-sm">Autenticando com Google...</div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const baseApi = import.meta.env.VITE_ROTA_API;

onMounted(async () => {
  // O backend concluiu o OAuth e setou o cookie httpOnly de sessão no redirect.
  // Não há mais token na URL. Confirmamos a sessão com uma chamada autenticada.
  // (raw axios + withCredentials para NÃO disparar o interceptor global de 401.)
  try {
    await axios.get(`${baseApi}/v1/user/me`, {
      withCredentials: true,
    });
    router.replace({ name: 'home' });
  } catch {
    router.replace({ name: 'signin' });
  }
});
</script>
