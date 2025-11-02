// Token y tiempo
const token = crypto.randomUUID();
localStorage.setItem("anony_token", token);
const start = Date.now();

// Estado del backend
let backendReady = false;
let wakeUpAttempted = false;

// Elementos del DOM
const form = document.getElementById("form");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const messageDiv = document.getElementById("message");
const progressBar = document.getElementById("progressBar");

const departamentoSelect = document.getElementById("departamento");
const provinciaSelect = document.getElementById("provincia");
const distritoSelect = document.getElementById("distrito");

// Estado del formulario
let currentStepIndex = 0;
const stepsHistory = ["1"]; // Historial de pasos para navegación

// Funciones de mensajes
function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = "block";
}

function hideMessage() {
  messageDiv.style.display = "none";
}

// Función para despertar el backend (health check)
async function wakeUpBackend() {
  if (wakeUpAttempted) return;
  wakeUpAttempted = true;

  // Mostrar mensaje informativo
  showMessage("⏳ Preparando el sistema, esto puede tomar unos segundos...", "info");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch("/health", {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      backendReady = true;
      console.log("Backend despierto y listo");
      // Ocultar mensaje después de 2 segundos
      setTimeout(() => hideMessage(), 2000);
    }
  } catch (error) {
    console.warn("Health check falló, pero continuaremos:", error.message);
    // Ocultar mensaje de todos modos
    hideMessage();
    backendReady = false;
  }
}

// Navegación de pasos
function showStep(stepName) {
  // Ocultar todos los pasos
  document.querySelectorAll(".step").forEach((s) => s.classList.remove("active"));

  // Mostrar el paso actual
  const stepEl = document.querySelector(`[data-step="${stepName}"]`);
  if (stepEl) {
    stepEl.classList.add("active");
  }

  // Actualizar barra de progreso (aproximado)
  const progress = ((currentStepIndex + 1) / 10) * 100;
  progressBar.style.width = Math.min(progress, 100) + "%";

  // Mostrar/ocultar botones
  prevBtn.style.display = currentStepIndex > 0 ? "block" : "none";

  if (stepName === "ubicacion") {
    nextBtn.style.display = "none";
    submitBtn.style.display = "block";
  } else {
    nextBtn.style.display = "block";
    submitBtn.style.display = "none";
  }

  // Scroll arriba
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Obtener el siguiente paso basado en las respuestas
function getNextStep(currentStep) {
  const formData = new FormData(form);

  switch (currentStep) {
    case "1":
      const esVictima = formData.get("esVictima");
      if (esVictima === "si") {
        return "3"; // Ir a rubro
      } else if (esVictima === "pasado") {
        return "2-tiempo-pasado"; // Cuánto tiempo pasó
      } else if (esVictima === "no") {
        return "2-no"; // Es testigo?
      }
      return null;

    case "2-no":
      // Los testigos van directo a ubicación
      return "ubicacion";

    case "2-tiempo-pasado":
      // Después de decir cuánto tiempo, pregunta cómo terminó
      return "3-pasado";

    case "3-pasado":
      // Después de decir cómo terminó, continúa con rubro
      return "3";

    case "3":
      // Después de rubro
      const esVictimaActual = formData.get("esVictima");
      if (esVictimaActual === "si") {
        return "4"; // Frecuencia de pago (solo víctimas actuales)
      } else {
        // Si fue en el pasado, salta frecuencia y va a monto
        return "5";
      }

    case "4":
      return "5"; // Monto

    case "5":
      return "6"; // Banda

    case "6":
      return "7"; // Atentados

    case "7":
      return "8"; // Evidencias

    case "8":
      return "9"; // Puso denuncia?

    case "9":
      const pusoDenuncia = formData.get("pusoDenuncia");
      if (pusoDenuncia === "si") {
        return "10-si-denuncia"; // Cómo denunció
      } else {
        return "10-no-denuncia"; // Por qué no denunció
      }

    case "10-si-denuncia":
      return "11"; // Resultado de denuncia

    case "11":
    case "10-no-denuncia":
      return "ubicacion"; // Último paso

    default:
      return null;
  }
}

// Validar que el paso actual tenga una respuesta
function validateCurrentStep() {
  const currentStep = stepsHistory[currentStepIndex];
  const stepEl = document.querySelector(`[data-step="${currentStep}"]`);

  if (!stepEl) return true;

  // Buscar todos los radios en el paso actual
  const radios = stepEl.querySelectorAll('input[type="radio"]');
  if (radios.length === 0) return true; // No hay radios, es válido

  // Verificar si algún radio está seleccionado
  const radioNames = new Set();
  radios.forEach((r) => radioNames.add(r.name));

  for (const name of radioNames) {
    const selected = stepEl.querySelector(`input[name="${name}"]:checked`);
    if (!selected) {
      showMessage("Por favor selecciona una opción antes de continuar", "error");
      return false;
    }
  }

  hideMessage();
  return true;
}

// Manejadores de navegación
nextBtn.addEventListener("click", () => {
  if (!validateCurrentStep()) return;

  const currentStep = stepsHistory[currentStepIndex];
  const nextStep = getNextStep(currentStep);

  if (nextStep) {
    currentStepIndex++;
    stepsHistory[currentStepIndex] = nextStep;
    showStep(nextStep);

    // Cargar departamentos si llegamos a ubicación
    if (nextStep === "ubicacion") {
      loadDepartamentos();
    }
  }
});

prevBtn.addEventListener("click", () => {
  if (currentStepIndex > 0) {
    currentStepIndex--;
    const previousStep = stepsHistory[currentStepIndex];
    showStep(previousStep);
  }
});

// Manejo de clicks en opciones de radio para mejorar UX
document.querySelectorAll(".radio-option").forEach((option) => {
  option.addEventListener("click", function () {
    // Despertar backend en la primera interacción
    if (!wakeUpAttempted) {
      wakeUpBackend();
    }

    const radio = this.querySelector('input[type="radio"]');
    if (radio) {
      radio.checked = true;

      // Quitar selected de todas las opciones del mismo grupo
      const name = radio.name;
      document
        .querySelectorAll(`input[name="${name}"]`)
        .forEach((r) => r.parentElement.classList.remove("selected"));

      // Agregar selected a esta opción
      this.classList.add("selected");
    }
  });
});

// Cargar datos de ubigeo
async function loadDepartamentos() {
  try {
    const res = await fetch("/api/ubigeo/departamentos");
    const data = await res.json();

    departamentoSelect.innerHTML =
      '<option value="">-- Selecciona un departamento --</option>';
    data.forEach((d) => {
      const option = document.createElement("option");
      option.value = d.departamento;
      option.textContent = d.departamento;
      departamentoSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error cargando departamentos:", err);
    departamentoSelect.innerHTML =
      '<option value="">Error al cargar departamentos</option>';
  }
}

departamentoSelect.addEventListener("change", async (e) => {
  const departamento = e.target.value;

  provinciaSelect.innerHTML =
    '<option value="">-- Selecciona una provincia --</option>';
  provinciaSelect.disabled = !departamento;
  distritoSelect.innerHTML =
    '<option value="">-- Selecciona provincia primero --</option>';
  distritoSelect.disabled = true;

  if (!departamento) return;

  try {
    provinciaSelect.innerHTML = '<option value="">-- Cargando... --</option>';
    const res = await fetch(
      `/api/ubigeo/provincias/${encodeURIComponent(departamento)}`
    );
    const data = await res.json();

    provinciaSelect.innerHTML =
      '<option value="">-- Selecciona una provincia --</option>';
    data.forEach((p) => {
      const option = document.createElement("option");
      option.value = p.provincia;
      option.textContent = p.provincia;
      provinciaSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error cargando provincias:", err);
    provinciaSelect.innerHTML =
      '<option value="">Error al cargar provincias</option>';
  }
});

provinciaSelect.addEventListener("change", async (e) => {
  const provincia = e.target.value;
  const departamento = departamentoSelect.value;

  distritoSelect.innerHTML =
    '<option value="">-- Selecciona un distrito --</option>';
  distritoSelect.disabled = !provincia;

  if (!provincia || !departamento) return;

  try {
    distritoSelect.innerHTML = '<option value="">-- Cargando... --</option>';
    const res = await fetch(
      `/api/ubigeo/distritos/${encodeURIComponent(
        departamento
      )}/${encodeURIComponent(provincia)}`
    );
    const data = await res.json();

    distritoSelect.innerHTML =
      '<option value="">-- Selecciona un distrito --</option>';
    data.forEach((d) => {
      const option = document.createElement("option");
      option.value = d.distrito;
      option.textContent = d.distrito;
      distritoSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error cargando distritos:", err);
    distritoSelect.innerHTML =
      '<option value="">Error al cargar distritos</option>';
  }
});

// Envío del formulario
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideMessage();

  const f = e.target;
  const formData = new FormData(f);

  // Validar ubicación
  if (!formData.get("departamento") || !formData.get("provincia") || !formData.get("distrito")) {
    showMessage("Por favor completa la ubicación", "error");
    return;
  }

  // Deshabilitar botón
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loading"></span>Enviando...';

  // Preparar datos
  const body = {
    token,
    elapsed: Date.now() - start,
    website: f.website.value,

    // Datos principales
    esVictima: formData.get("esVictima") || null,
    esTestigo: formData.get("esTestigo") || null,
    tiempoPasado: formData.get("tiempoPasado") || null,
    comoTermino: formData.get("comoTermino") || null,
    rubro: formData.get("rubro") || null,
    frecuencia: formData.get("frecuencia") || null,
    monto: formData.get("monto") || null,
    banda: formData.get("banda") || null,
    atentado: formData.get("atentado") || null,
    tieneEvidencias: formData.get("tieneEvidencias") || null,
    pusoDenuncia: formData.get("pusoDenuncia") || null,
    comoDenuncia: formData.get("comoDenuncia") || null,
    resultadoDenuncia: formData.get("resultadoDenuncia") || null,
    porqueNoDenuncia: formData.get("porqueNoDenuncia") || null,

    // Ubicación
    departamento: formData.get("departamento"),
    provincia: formData.get("provincia"),
    distrito: formData.get("distrito"),

    // Metadata
    dateBucket: new Date().toISOString(),
    sourceChannel: "web",
  };

  try {
    // Si el backend no estaba listo, mostrar mensaje de espera
    if (!backendReady) {
      showMessage("⏳ Conectando con el servidor, por favor espera...", "info");
      await wakeUpBackend();
    }

    const r = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await r.text();

    if (r.ok) {
      // Marcar como completado en localStorage
      localStorage.setItem("form_completed", "true");
      // Redirigir a página de agradecimiento
      window.location.href = "thankyou.html";
    } else {
      showMessage("✗ Error: " + text, "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Enviar reporte";
    }
  } catch (err) {
    console.error(err);
    showMessage(
      "✗ Error de conexión. Verifica tu internet e intenta de nuevo.",
      "error"
    );
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar reporte";
  }
});

// Inicializar
showStep("1");
