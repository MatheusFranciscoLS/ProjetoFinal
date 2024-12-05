import axios from 'axios';

// Criando uma instância do axios com configurações base
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {
    // Verifica se há token no localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    // Verifica se a resposta tem dados
    if (!response?.data) {
      throw new Error('Resposta sem dados');
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // Erro do servidor (status code não 2xx)
      switch (error.response.status) {
        case 401:
          // Não autorizado - limpa o token e redireciona para login
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Acesso proibido
          console.error('Acesso proibido');
          break;
        case 404:
          // Não encontrado
          console.error('Recurso não encontrado');
          break;
        case 500:
          // Erro interno do servidor
          console.error('Erro interno do servidor');
          break;
        default:
          console.error('Erro na resposta do servidor:', error.response.status);
      }
    } else if (error.request) {
      // Erro de conexão
      console.error('Erro de conexão com o servidor');
    } else {
      // Outros erros
      console.error('Erro:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
