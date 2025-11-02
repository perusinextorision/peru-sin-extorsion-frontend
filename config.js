// Configuración del frontend
// Este archivo puede ser reemplazado en Netlify usando variables de entorno

const CONFIG = {
  // URL del backend API
  API_URL: window.location.origin,

  // Para Netlify, puedes sobreescribir esto con una variable de entorno
  // usando el build command: echo "const CONFIG = { API_URL: '${API_URL}' };" > frontend/config.js
};

// Hacer disponible globalmente
window.APP_CONFIG = CONFIG;
