# Perú Sin Extorsión - Frontend

Frontend web de la plataforma de recopilación anónima de datos estadísticos sobre extorsión en Perú.

## 🚀 Demo

[Ver demo en vivo](https://tu-dominio.netlify.app) _(próximamente)_

## 📋 Descripción

Este es el frontend de **Perú Sin Extorsión**, una plataforma que permite a víctimas y testigos de extorsión reportar casos de forma anónima para generar estadísticas públicas.

### Características principales:

- ✅ Formulario multi-paso con lógica condicional
- ✅ Diseño responsive y moderno
- ✅ Selección geográfica en cascada (Departamento → Provincia → Distrito)
- ✅ Sin cookies ni tracking
- ✅ Validación en tiempo real
- ✅ Página de recursos y ayuda

## 🛠️ Tecnologías

- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con gradientes y animaciones
- **Vanilla JavaScript** - Sin frameworks para máxima privacidad y rendimiento
- **Fetch API** - Comunicación con backend

## 📦 Estructura

```
frontend/
├── index.html         # Página de inicio/landing
├── form.html          # Formulario multi-paso
├── form-logic.js      # Lógica del formulario y navegación
├── thankyou.html      # Página de agradecimiento con recursos
├── stats.html         # Estadísticas públicas (próximamente)
└── config.js          # Configuración del frontend
```

## 🚀 Instalación Local

### Opción 1: Servidor simple con Python

```bash
# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

### Opción 2: Servidor con Node.js

```bash
npx http-server -p 3000
```

### Opción 3: Live Server (VS Code)

Instala la extensión **Live Server** y haz clic derecho en `index.html` → "Open with Live Server"

## ⚙️ Configuración

Edita `config.js` para configurar la URL del backend:

```javascript
const CONFIG = {
  API_URL: window.location.origin // o 'https://tu-backend.com'
};
window.APP_CONFIG = CONFIG;
```

## 🌐 Despliegue en Netlify

### Método 1: Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Método 2: Interfaz Web de Netlify

1. Conecta tu repositorio de GitHub
2. Configuración de build:
   - **Build command:** (dejar vacío)
   - **Publish directory:** `.` (raíz del proyecto)
3. Variables de entorno:
   - `API_URL`: URL de tu backend en producción

### Configuración de Redirects

Crea un archivo `_redirects` en la raíz:

```
/api/*  https://tu-backend.com/api/:splat  200
```

O en `netlify.toml`:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://tu-backend.com/api/:splat"
  status = 200
  force = true
```

## 🔗 Backend

Este frontend requiere el backend para funcionar. Repositorio del backend:

👉 [peru-sin-extorsion-backend](https://github.com/perusinextorision/peru-sin-extorsion-backend)

## 📱 Páginas

### index.html
Página de inicio con:
- Explicación del proyecto
- Información sobre privacidad
- Badge de anonimato
- Botón para comenzar el reporte

### form.html
Formulario multi-paso con:
- 11 pasos con lógica condicional
- Navegación adelante/atrás
- Barra de progreso
- Validación por paso
- Integración con API de ubigeo

### thankyou.html
Página post-envío con:
- Mensaje de confirmación
- Información sobre qué pasa con los datos
- Recursos para denuncias oficiales (911, 1818, DIVEXT-PNP)
- ONGs y organizaciones de apoyo
- Recomendaciones de seguridad

### stats.html
Dashboard de estadísticas públicas _(próximamente)_

## 🎨 Personalización

### Colores

Los colores principales están definidos en gradientes CSS:

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Modificar flujo del formulario

Edita `form-logic.js`, función `getNextStep()` para cambiar la lógica condicional.

## 🔒 Privacidad

El frontend NO recopila:
- ❌ Cookies
- ❌ LocalStorage persistente (solo para evitar múltiples envíos)
- ❌ Tracking de terceros
- ❌ Analytics

## 📄 Licencia

MIT License - Ver archivo [LICENSE](LICENSE)

## 📞 Contacto

**Email del proyecto:** perusinextorision@proton.me

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit tus cambios (`git commit -m 'Agrega mejora'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

## 🙏 Agradecimientos

- Diseño inspirado en principios de UI/UX modernos
- Datos de ubigeo por INEI (Instituto Nacional de Estadística e Informática)

---

<div align="center">

**Juntos podemos visibilizar y combatir la extorsión en Perú**

⭐ Si este proyecto te parece útil, dale una estrella

</div>
