import axios from 'axios';

const baseApi = import.meta.env.VITE_ROTA_API;

// O token vem como cookie httpOnly (o JS não o lê). O browser o envia
// automaticamente quando withCredentials=true. Não há mais Bearer/localStorage:
// o AuthGuard do backend lê apenas request.cookies.token.

// Refresh dedupado: o refreshToken ROTACIONA no backend, então dois refreshes
// concorrentes invalidariam um ao outro. Compartilhamos uma única promise.
let refreshPromise: Promise<unknown> | null = null;

function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseApi}/v1/auth/refresh-token`, null, { withCredentials: true })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Função para criar instância de Axios
export function api() {
  const instance = axios.create({
    withCredentials: true, // envia/recebe o cookie httpOnly de auth (cross-origin)
    // baseURL pode ser customizada por serviço, se necessário
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;
      const original = error.config;
      const url = original?.url || '';
      const isAuthRoute =
        url.includes('/auth/login') || url.includes('/auth/refresh-token');

      // 401 numa rota protegida: tenta renovar a sessão UMA vez e repete.
      if (status === 401 && original && !original._retry && !isAuthRoute) {
        original._retry = true;
        try {
          await refreshSession();
          return instance(original);
        } catch {
          window.location.href = '/#/welcome';
          return Promise.reject(error);
        }
      }

      // Refresh já tentado (ou 403): desloga.
      if ((status === 401 || status === 403) && !isAuthRoute) {
        window.location.href = '/#/welcome';
      }

      return Promise.reject(error);
    },
  );

  return instance;
}
