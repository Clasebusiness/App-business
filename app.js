// ==================== ESTADO GLOBAL ====================

let currentUser = null;
let currentAIStyle = null;
let storeProducts = [
  {
    id: 1,
    name: "Cera premium para cabello",
    price: 15990,
    category: "hair",
    image:
      "https://images.pexels.com/photos/3738341/pexels-photo-3738341.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 2,
    name: "Aceite nutritivo para barba",
    price: 12500,
    category: "beard",
    image:
      "https://images.pexels.com/photos/4056009/pexels-photo-4056009.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 3,
    name: "Espuma / crema de afeitar",
    price: 8750,
    category: "beard",
    image:
      "https://images.pexels.com/photos/3738345/pexels-photo-3738345.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 4,
    name: "Set de peines profesionales",
    price: 25000,
    category: "accessories",
    image:
      "https://images.pexels.com/photos/3993444/pexels-photo-3993444.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

let cart = [];
let notifications = [];

// ==================== UTILIDADES ====================

function formatCLP(value) {
  return "$" + value.toLocaleString("es-CL");
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromStorage(key, defaultValue) {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

// ==================== NAVEGACIÓN ====================

function showView(viewId) {
  const views = document.querySelectorAll(".view");
  views.forEach((v) => v.classList.add("hidden", "active"));

  const view = document.getElementById(viewId);
  if (view) {
    view.classList.remove("hidden");
    view.classList.add("active");
  }

  // Actualizar tabs activos
  const tabMap = {
    "view-home": "tab-home",
    "view-style": "tab-style",
    "view-bookings": "tab-bookings",
    "view-store": "tab-store",
    "view-profile": "tab-profile",
  };
  Object.values(tabMap).forEach((tabId) => {
    const el = document.getElementById(tabId);
    if (el) el.classList.remove("active");
  });
  if (tabMap[viewId]) {
    const activeTab = document.getElementById(tabMap[viewId]);
    if (activeTab) activeTab.classList.add("active");
  }
}

// Botón de comenzar desde Splash
function goToAuth() {
  showView("view-auth");
}

// ==================== LOGIN FALSO (MVP) ====================

function setLoggedUser(name, provider) {
  currentUser = {
    name,
    provider,
  };
  saveToStorage("bai-user", currentUser);

  document.getElementById("btn-logout").classList.remove("hidden");
  document.getElementById("home-username").innerText = currentUser.name;

  initProfileFromStorage();
  updateHomeCards();
  renderBookings();
  renderRewards();
  renderGallery();
  renderNotifications();
  renderStore();

  showView("view-home");
}

function fakeRegisterEmail() {
  const name = prompt("Escribe tu nombre para crear el perfil:");
  if (!name) return;
  setLoggedUser(name, "Email");
}

function fakeSocialLogin(provider) {
  const name = prompt(`Nombre para tu perfil usando ${provider}:`) || "Invitado";
  setLoggedUser(name, provider);
}

function logout() {
  currentUser = null;
  localStorage.removeItem("bai-user");
  document.getElementById("btn-logout").classList.add("hidden");
  showView("view-splash");
}

document.getElementById("btn-logout").addEventListener("click", logout);

// ==================== PERFIL ====================

function initProfileFromStorage() {
  const profile = loadFromStorage("bai-profile", null);
  if (!profile) return;

  document.getElementById("profile-name").value = profile.name || "";
  document.getElementById("profile-birthday").value =
    profile.birthday || "";
  document.getElementById("profile-hair").value = profile.hair || "";
  document.getElementById("profile-style").value = profile.style || "";
  document.getElementById("profile-goal").value = profile.goal || "";

  if (profile.name) {
    document.getElementById("home-username").innerText = profile.name;
  }

  updateHomeRecommendation(profile);
}

function saveProfile() {
  const profile = {
    name: document.getElementById("profile-name").value.trim(),
    birthday: document.getElementById("profile-birthday").value,
    hair: document.getElementById("profile-hair").value,
    style: document.getElementById("profile-style").value,
    goal: document.getElementById("profile-goal").value.trim(),
  };

  saveToStorage("bai-profile", profile);
  alert("Perfil guardado correctamente ✅");

  if (profile.name) {
    document.getElementById("home-username").innerText = profile.name;
  }

  updateHomeRecommendation(profile);
}

function updateHomeRecommendation(profile) {
  const el = document.getElementById("home-recommendation");
  if (!profile || !profile.style) {
    el.innerText =
      "Completa tu tipo de estilo personal en el perfil para recomendaciones más precisas.";
    return;
  }

  let msg = "";
  switch (profile.style) {
    case "Clásico":
      msg =
        "Te recomendamos mantener un corte clásico con laterales prolijos y barba pulida, ideal para un estilo ejecutivo.";
      break;
    case "Moderno / contemporáneo":
      msg =
        "Puedes probar un fade medio con textura en la parte superior y barba bien recortada para un look moderno.";
      break;
    case "Casual / relajado":
      msg =
        "Estilos con volumen natural y poco mantenimiento funcionarán perfecto para tu día a día.";
      break;
    case "Formal / profesional":
      msg =
        "Un corte limpio con raya marcada y barba alineada proyectará una imagen profesional sólida.";
      break;
    case "Urbano / street style":
      msg =
        "Prueba un high fade con textura y detalles en la barba para un toque urbano.";
      break;
    case "Hipster / bohemio":
      msg =
        "Una barba más larga, bien cuidada, combinada con un undercut puede reflejar tu estilo bohemio.";
      break;
    case "Minimalista":
      msg =
        "Un corte corto, líneas simples y barba muy prolija encajan con un estilo minimalista.";
      break;
    case "Elegante y sofisticado":
      msg =
        "Puedes ir por un peinado peinado hacia atrás con volumen controlado y barba perfectamente definida.";
      break;
    case "Atrevido y experimental":
      msg =
        "Cortes con degradados marcados, líneas de diseño o cambios de color sutiles te ayudarán a destacar.";
      break;
    default:
      msg =
        "Completa tu estilo personal en el perfil para recibir recomendaciones más específicas.";
  }
  el.innerText = msg;
}

function updateHomeCards() {
  const bookings = loadFromStorage("bai-bookings", []);
  const nextEl = document.getElementById("home-next-booking");
  if (bookings.length === 0) {
    nextEl.innerText = "Aún no tienes reservas. ¡Agenda tu próximo corte!";
    return;
  }
  const next = bookings[bookings.length - 1];
  nextEl.innerText = `${next.service} con ${
    next.barber || "barbero recomendado"
  } el ${next.date} a las ${next.time} hrs.`;
}

// ==================== IA DE ESTILO (SIMULACIÓN) ====================

function generateAIStyle() {
  const fileInput = document.getElementById("style-photo");
  const area = document.getElementById("style-area").value;
  let personal = document.getElementById("style-personal").value;

  if (!area) {
    alert("Selecciona la zona a proyectar (corte, barba o color).");
    return;
  }

  if (!personal) {
    const profile = loadFromStorage("bai-profile", {});
    personal = profile.style || "Moderno / contemporáneo";
  }

  let description = "";
  if (area === "corte") {
    if (personal.includes("Clásico")) {
      description =
        "Corte clásico con laterales cortos y parte superior con leve volumen peinado hacia atrás. Ideal para reuniones y un estilo ejecutivo.";
    } else if (personal.includes("Urbano")) {
      description =
        "Fade medio-alto con textura desordenada en la parte superior, generando un look urbano y juvenil.";
    } else if (personal.includes("Atrevido")) {
      description =
        "Degradado fuerte con líneas de diseño laterales y mayor contraste entre laterales y parte superior.";
    } else {
      description =
        "Corte equilibrado, laterales degradados y parte superior con textura natural para adaptarse tanto a contextos formales como casuales.";
    }
  } else if (area === "barba") {
    description =
      "Perfilado de barba siguiendo la línea natural de tu rostro, limpiando mejillas y cuello para resaltar la mandíbula y mantener un estilo prolijo.";
  } else if (area === "color") {
    description =
      "Recomendación de matices fríos para equilibrar tu tono de piel, con reflejos suaves en la parte superior para mayor profundidad.";
  }

  const resultText = document.getElementById("style-result-text");
  resultText.innerText = description;

  const resultContainer = document.getElementById("style-result");
  resultContainer.classList.remove("hidden");

  const imageDiv = document.getElementById("style-result-image");
  if (fileInput.files && fileInput.files[0]) {
    const url = URL.createObjectURL(fileInput.files[0]);
    imageDiv.style.backgroundImage = `url('${url}')`;
    imageDiv.classList.remove("hidden");
  } else {
    imageDiv.classList.add("hidden");
  }

  currentAIStyle = {
    area,
    personal,
    description,
    date: new Date().toLocaleString("es-CL"),
  };
}

function saveCurrentStyle() {
  if (!currentAIStyle) {
    alert("Primero genera un estilo con la IA.");
    return;
  }
  const gallery = load
