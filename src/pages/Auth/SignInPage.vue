<template>
  <q-page padding>
    <div class="container">
      <div class="container-content">
        <!-- Contêiner exclusivo para o título -->
        <div class="title-container">
          <div class="title">Fazer Login</div>
        </div>
        <div class="global-error" v-if="globalError">{{ globalError }}</div>
        <div class="form">
          <div class="inputs-wrapper">
            <div>
              <InputEmail v-model="email" :errors="errors" label="E-mail" />
              <div class="error" v-if="errors.email && typeof errors.email === 'string'">{{ errors.email }}</div>
            </div>
            <div>
              <InputPassword v-model="password" :errors="errors" />
              <div class="error" v-if="errors.password && typeof errors.password === 'string'">
                {{ errors.password }}
              </div>
            </div>
          </div>
          <CButton label="Entrar" :loading="isLoading" @click="handleSubmit" />
          <div class="divider">
            <div class="line"></div>
            <span class="divider-text">ou</span>
            <div class="line"></div>
          </div>
          <button class="google-button" @click="continueWithGoogle">
            <img :src="googleIcon" alt="Google Icon" class="google-icon" />
            <span class="google-button-text">Entrar com o Google</span>
          </button>
        </div>
      </div>
    </div>
    <ModalGenericoAlert
      :title="modalContent"
      :open="isOpen"
      :description="modalDescription"
      :text-button="'Fechar'"
    />
  </q-page>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import InputPassword from '@/shared/components/InputPassword.vue';
import InputEmail from '@/shared/components/InputEmail.vue';
import ModalGenericoAlert from '@/shared/components/ModalGenericoAlert.vue';

import googleIcon from '@/shared/assets/googleIcon.svg';
import { useRegisterStore } from '@/stores/registerStore';
import CButton from '@/shared/components/CButton.vue';

const isLoading = ref(false);
const isValidatingForm = ref(false);

const modalContent = ref('');
const modalDescription = ref('');
const isOpen = ref(false);
const isValid = ref(true);

const email = ref('');
const password = ref('');
const errors = ref({});

const globalError = ref('');

const router = useRouter();
const registerStore = useRegisterStore();

const resetModal = () => {
  modalContent.value = '';
  modalDescription.value = '';
  isOpen.value = false;
  globalError.value = '';
};

const validateForm = () => {
  isValidatingForm.value = true;
  errors.value = {};
  isValid.value = true;

  if (!email.value) {
    errors.value.email = 'Campo obrigatório';
    isValid.value = false;
  }

  if (!password.value) {
    errors.value.password = 'Campo obrigatório';
    isValid.value = false;
  }
};

watch([email, password], () => {
  if (!isValidatingForm.value) return;
  validateForm();
});

const handleSubmit = async () => {
  resetModal();
  validateForm();

  if (!isValid.value) return;

  try {
    isLoading.value = true;
    await registerStore.login({
      email: email.value,
      password: password.value,
    });

    router.push({ name: 'home' });
  } catch (error) {
    console.error('Erro no login:', error);
    const statusCode = error?.status || error?.statusCode || error?.response?.status;
    if (error?.response?.data) {
      console.error('Resposta do backend:', error.response.data);
    }
    handleApiError(statusCode);
  } finally {
    isLoading.value = false;
  }
};

const handleApiError = (statusCode) => {
  if (statusCode === 401 || statusCode === 403 || statusCode === 404) {
    globalError.value = 'E-mail ou senha incorretos ou inválidos';
    errors.value.email = true;
    errors.value.password = true;
  } else {
    isOpen.value = true;
    modalContent.value = 'Ocorreu um erro ao tentar fazer login';
    modalDescription.value = 'Tente novamente mais tarde';
  }
};

const continueWithGoogle = () => {
  // Redirect de página inteira para o OAuth do backend; o retorno cai em google-callback.
  registerStore.googleLogin();
};
</script>

<style scoped>
.header-bar {
  display: flex;
  align-items: center;
  margin-top: 24px;
  padding: 6px 20px;
}

.return-button {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.logo {
  width: 165px;
}

.container {
  padding: 0 20px;
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Agrupamento dos elementos internos com espaçamento consistente */
.container-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* Novo contêiner para o título para isolar seus estilos */
.title-container {
  display: flex;
  justify-content: center;
  padding: 0 10px;
}

.title {
  color: var(--Cores-Secundria-600, #314b39);
  text-align: center;

  font-size: var(--Tipo-Tamanho-Xl, 20px);
  font-style: normal;
  font-weight: 700;
  line-height: 120%; /* 24px */
  letter-spacing: -0.4px;
}

.global-error {
  color: #b00020;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  margin-top: 0;
  /* O container aplica gap 40px entre elementos. Aqui queremos 32px até o E-mail. 40 - 8 = 32px */
  margin-bottom: -8px; 
}

.form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.inputs-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
}

.error {
  color: #b00020;
  font-size: 14px;
  margin-top: 5px;
  line-height: 21px;
}

.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 40px 0;
}

.divider-text {
  color: #314b39;
  font-size: 14px;
}

.line {
  flex: 1 0 0;
  height: 0;
  border-top: 1px solid var(--Cores-Secundria-200, #9db8a1);
}

.google-button {
  display: flex;
  height: 48px;
  padding: 12px 24px;
  justify-content: center;
  align-items: center;
  gap: 12px;
  width: 100%;
  border-radius: 8px;
  border: 2px solid #307714;
  background: #f9fcfa;
  cursor: pointer;
}

.google-icon {
  width: 20px;
  height: 20px;
}

.google-button-text {
  color: var(--primary-900, #245017);
  font-size: 16px;
  font-weight: 700;
  line-height: 120%;
}
</style>
