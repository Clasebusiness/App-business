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
  try {
    return "$" + Number(value).toLocaleString("es-CL");
  } catch {
    return "$" + value;
  }
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
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

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// ==================== NAVEGACIÓN ====================
function showView(viewId) {
  const views = document.querySelectorAll(".view");
  views.forEach((v) => v.classList.add("hidden"));
  views.forEach((v) => v.classList.remove("active"));

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
  currentUser = { name, provider };
  saveToStorage("bai-user", currentUser);

  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) logoutBtn.classList.remove("hidden");

  const homeName = document.getElementById("home-username");
  if (homeName) homeName.innerText = currentUser.name;

  initProfileFromStorage();
  hydrateState();
  updateHomeCards();
  renderBookings();
  renderRewards();
  renderGallery();
  renderNotifications();
  renderStore();
  renderCartBadge();

  showView("view-home");

  pushNotification({
    type: "welcome",
    title: `Bienvenido/a, ${currentUser.name} 👋`,
    body: "Tu perfil y tus estilos se guardan en este dispositivo (MVP).",
  });
}

function fakeRegisterEmail() {
  const name = prompt("Escribe tu nombre para crear el perfil:");
  if (!name) return;
  setLoggedUser(name.trim(), "Email");
}

function fakeSocialLogin(provider) {
  const name = (prompt(`Nombre para tu perfil usando ${provider}:`) || "Invitado").trim();
  setLoggedUser(name || "Invitado", provider);
}

function logout() {
  currentUser = null;
  localStorage.removeItem("bai-user");
  document.getElementById("btn-logout")?.classList.add("hidden");
  showView("view-splash");
}

document.getElementById("btn-logout")?.addEventListener("click", logout);

// ==================== PERFIL ====================
function initProfileFromStorage() {
  const profile = loadFromStorage("bai-profile", null);
  if (!profile) return;

  document.getElementById("profile-name").value = profile.name || "";
  document.getElementById("profile-birthday").value = profile.birthday || "";
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

  pushNotification({
    type: "profile",
    title: "Perfil actualizado ✅",
    body: "Tus preferencias ayudarán a mejorar las recomendaciones.",
  });
}

function updateHomeRecommendation(profile) {
  const el = document.getElementById("home-recommendation");
  if (!el) return;

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
        "Puedes ir por un peinado hacia atrás con volumen controlado y barba perfectamente definida.";
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
  if (!nextEl) return;

  if (bookings.length === 0) {
    nextEl.innerText = "Aún no tienes reservas. ¡Agenda tu próximo corte!";
    return;
  }

  const next = bookings[bookings.length - 1];
  nextEl.innerText = `${next.service} con ${next.barber || "barbero recomendado"} el ${next.date} a las ${next.time} hrs.`;
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
  let imageDataUrl = null;

  if (fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    const url = URL.createObjectURL(file);
    imageDiv.style.backgroundImage = `url('${url}')`;
    imageDiv.classList.remove("hidden");

    // Convertimos a base64 para persistir en LocalStorage
    const reader = new FileReader();
    reader.onload = () => {
      imageDataUrl = reader.result;
      currentAIStyle = {
        id: uid("style"),
        area,
        personal,
        description,
        imageDataUrl,
        date: new Date().toLocaleString("es-CL"),
      };
    };
    reader.readAsDataURL(file);
  } else {
    imageDiv.classList.add("hidden");
    currentAIStyle = {
      id: uid("style"),
      area,
      personal,
      description,
      imageDataUrl: null,
      date: new Date().toLocaleString("es-CL"),
    };
  }

  pushNotification({
    type: "ai",
    title: "Estilo generado ✅",
    body: "Si te gustó, guárdalo en tu galería.",
  });
}

function saveCurrentStyle() {
  if (!currentAIStyle) {
    alert("Primero genera un estilo con la IA.");
    return;
  }
  const gallery = loadFromStorage("bai-gallery", []);
  gallery.push(currentAIStyle);
  saveToStorage("bai-gallery", gallery);

  renderGallery();

  pushNotification({
    type: "gallery",
    title: "Estilo guardado en tu galería ✅",
    body: `Zona: ${currentAIStyle.area.toUpperCase()} • ${currentAIStyle.personal}`,
  });

  alert("¡Listo! Estilo guardado ✅");
}

function renderGallery() {
  const gallery = loadFromStorage("bai-gallery", []);
  const list = document.getElementById("gallery-list");
  const empty = document.getElementById("gallery-empty");
  if (!list || !empty) return;

  list.innerHTML = "";

  if (!gallery.length) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  gallery
    .slice()
    .reverse()
    .forEach((item) => {
      const card = document.createElement("div");
      card.className = "rounded-2xl border border-[#223349] p-3";

      const areaLabel =
        item.area === "corte" ? "Corte" : item.area === "barba" ? "Barba" : "Color";

      card.innerHTML = `
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs text-[#90a9cb] uppercase tracking-[0.2em]">${areaLabel} • ${item.personal}</p>
            <p class="text-[11px] text-[#90a9cb] mt-1">${item.date}</p>
          </div>
          <button class="text-xs px-3 py-1 rounded-full border border-[#223349]" data-del="${item.id}">
            Eliminar
          </button>
        </div>

        ${item.imageDataUrl ? `<img src="${item.imageDataUrl}" class="w-full h-40 object-cover rounded-xl mt-3 border border-[#223349]" alt="estilo">` : ""}

        <p class="text-sm mt-3">${item.description}</p>

        <div class="flex gap-2 mt-3">
          <button class="text-xs px-3 py-1 rounded-full border border-[#223349]" data-reuse="${item.id}">
            Usar como referencia
          </button>
          <button class="text-xs px-3 py-1 rounded-full border border-[#223349]" data-copy="${item.id}">
            Copiar texto
          </button>
        </div>
      `;

      list.appendChild(card);
    });

  // Eventos (delegación)
  list.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-del");
      deleteGalleryItem(id);
    });
  });

  list.querySelectorAll("[data-reuse]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-reuse");
      reuseGalleryItem(id);
    });
  });

  list.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-copy");
      const gallery = loadFromStorage("bai-gallery", []);
      const item = gallery.find((x) => x.id === id);
      if (!item) return;
      copyText(item.description);
      alert("Texto copiado ✅");
    });
  });
}

function deleteGalleryItem(id) {
  const gallery = loadFromStorage("bai-gallery", []);
  const updated = gallery.filter((x) => x.id !== id);
  saveToStorage("bai-gallery", updated);
  renderGallery();
}

function reuseGalleryItem(id) {
  const gallery = loadFromStorage("bai-gallery", []);
  const item = gallery.find((x) => x.id === id);
  if (!item) return;

  // Pre-cargamos inputs de IA
  document.getElementById("style-area").value = item.area || "";
  document.getElementById("style-personal").value = item.personal || "";

  const resultText = document.getElementById("style-result-text");
  const resultContainer = document.getElementById("style-result");
  const imageDiv = document.getElementById("style-result-image");

  resultText.innerText = item.description || "";
  resultContainer.classList.remove("hidden");

  if (item.imageDataUrl) {
    imageDiv.style.backgroundImage = `url('${item.imageDataUrl}')`;
    imageDiv.classList.remove("hidden");
  } else {
    imageDiv.classList.add("hidden");
  }

  currentAIStyle = { ...item, id: uid("style") }; // como “nuevo”
  showView("view-style");
}

function clearGallery() {
  if (!confirm("¿Seguro que quieres vaciar la galería?")) return;
  saveToStorage("bai-gallery", []);
  renderGallery();
}

function exportGalleryJSON() {
  const gallery = loadFromStorage("bai-gallery", []);
  const json = JSON.stringify(gallery, null, 2);
  downloadTextFile(`bai-gallery-${Date.now()}.json`, json);
}

// ==================== RESERVAS (MVP) ====================
function saveBooking() {
  const service = document.getElementById("booking-service").value;
  const barber = document.getElementById("booking-barber").value;
  const date = document.getElementById("booking-date").value;
  const time = document.getElementById("booking-time").value;

  if (!date || !time) {
    alert("Selecciona fecha y hora para confirmar la reserva.");
    return;
  }

  const booking = {
    id: uid("booking"),
    service,
    barber: barber || "",
    date,
    time,
    createdAt: Date.now(),
  };

  const bookings = loadFromStorage("bai-bookings", []);
  bookings.push(booking);
  saveToStorage("bai-bookings", bookings);

  // Recompensas: sumar créditos por reserva
  addCredits(50);

  pushNotification({
    type: "booking",
    title: "Reserva confirmada ✅",
    body: `${service} • ${date} ${time}`,
  });

  // Reset form time (deja fecha)
  document.getElementById("booking-time").value = "";

  renderBookings();
  updateHomeCards();
  renderRewards();

  alert("Reserva guardada ✅ (MVP)");
}

function renderBookings() {
  const list = document.getElementById("booking-list");
  if (!list) return;

  const bookings = loadFromStorage("bai-bookings", []).slice().reverse();

  if (!bookings.length) {
    list.innerHTML = `<p class="text-xs text-[#90a9cb]">Aún no tienes reservas.</p>`;
    return;
  }

  list.innerHTML = "";
  bookings.forEach((b) => {
    const el = document.createElement("div");
    el.className = "rounded-2xl border border-[#223349] p-3 flex items-start justify-between gap-3";
    el.innerHTML = `
      <div>
        <p class="text-sm font-semibold">${b.service}</p>
        <p class="text-xs text-[#90a9cb] mt-1">${b.date} • ${b.time} hrs</p>
        <p class="text-xs text-[#90a9cb] mt-1">${b.barber ? "Con: " + b.barber : "Profesional: recomendado"}</p>
      </div>
      <button class="text-xs px-3 py-1 rounded-full border border-[#223349]" data-del="${b.id}">
        Eliminar
      </button>
    `;
    list.appendChild(el);
  });

  list.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-del");
      deleteBooking(id);
    });
  });
}

function deleteBooking(id) {
  const bookings = loadFromStorage("bai-bookings", []);
  const updated = bookings.filter((b) => b.id !== id);
  saveToStorage("bai-bookings", updated);
  renderBookings();
  updateHomeCards();
}

function clearBookings() {
  if (!confirm("¿Borrar todas las reservas?")) return;
  saveToStorage("bai-bookings", []);
  renderBookings();
  updateHomeCards();
}

// ==================== RECOMPENSAS / REFERIDOS ====================
function getRewardsState() {
  return loadFromStorage("bai-rewards", { credits: 0, referrals: 0 });
}

function setRewardsState(state) {
  saveToStorage("bai-rewards", state);
}

function addCredits(amount) {
  const state = getRewardsState();
  state.credits = clamp((state.credits || 0) + amount, 0, 999999);
  setRewardsState(state);
}

function addReferral() {
  const state = getRewardsState();
  state.referrals = clamp((state.referrals || 0) + 1, 0, 9999);

  // Créditos por referido (escala)
  const r = state.referrals;
  const bonus = r <= 3 ? 80 : r <= 6 ? 120 : 180;
  state.credits = clamp((state.credits || 0) + bonus, 0, 999999);

  setRewardsState(state);
}

function levelFromReferrals(referrals) {
  if (referrals >= 7) return "Pro";
  if (referrals >= 4) return "Avanzado";
  return "Básico";
}

function referralCode() {
  const saved = loadFromStorage("bai-refcode", null);
  if (saved) return saved;
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  saveToStorage("bai-refcode", code);
  return code;
}

function renderRewards() {
  const creditsEl = document.getElementById("rewards-credits");
  const levelEl = document.getElementById("rewards-level");
  const refEl = document.getElementById("rewards-ref-link");
  const countEl = document.getElementById("rewards-ref-count");

  if (!creditsEl || !levelEl || !refEl || !countEl) return;

  const state = getRewardsState();
  const code = referralCode();
  const link = `${location.origin}${location.pathname}#ref=${code}`;

  refEl.innerText = link;
  creditsEl.innerText = formatCLP(state.credits || 0);
  levelEl.innerText = `Nivel: ${levelFromReferrals(state.referrals || 0)}`;
  countEl.innerText = `Referidos: ${state.referrals || 0}`;
}

function simulateReferral() {
  addReferral();
  renderRewards();

  pushNotification({
    type: "ref",
    title: "¡Nuevo referido! 🎉",
    body: "Se sumaron créditos a tu cuenta (MVP).",
  });

  alert("Referido simulado ✅");
}

function copyReferralLink() {
  const code = referralCode();
  const link = `${location.origin}${location.pathname}#ref=${code}`;
  copyText(link);
  alert("Link copiado ✅");
}

function resetRewards() {
  if (!confirm("¿Resetear créditos y referidos?")) return;
  setRewardsState({ credits: 0, referrals: 0 });
  renderRewards();
}

// ==================== TIENDA / CARRITO ====================
function hydrateState() {
  cart = loadFromStorage("bai-cart", []);
  notifications = loadFromStorage("bai-notifs", []);
}

function persistCart() {
  saveToStorage("bai-cart", cart);
  renderCartBadge();
}

function categoryLabel(cat) {
  if (cat === "hair") return "Cabello";
  if (cat === "beard") return "Barba";
  if (cat === "accessories") return "Accesorios";
  return "General";
}

function renderStore(items = storeProducts) {
  const grid = document.getElementById("store-grid");
  if (!grid) return;

  grid.innerHTML = "";

  items.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <div class="w-full h-28 rounded-xl bg-cover bg-center border border-[#182434]" style="background-image:url('${p.image}')"></div>
      <p class="text-xs text-[#90a9cb] mt-3">${categoryLabel(p.category)}</p>
      <p class="text-sm font-semibold mt-1">${p.name}</p>
      <div class="flex items-center justify-between mt-3">
        <p class="text-sm font-bold">${formatCLP(p.price)}</p>
        <button class="text-xs px-3 py-1 rounded-full border border-[#182434]" data-add="${p.id}">
          Agregar
        </button>
      </div>
    `;

    grid.appendChild(card);
  });

  grid.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-add"));
      addToCart(id);
    });
  });

  renderCartBadge();
}

function filterStore() {
  const q = (document.getElementById("store-search")?.value || "").toLowerCase().trim();
  const cat = document.getElementById("store-category")?.value || "";
  const sort = document.getElementById("store-sort")?.value || "relevance";

  let items = storeProducts.slice();

  if (cat) items = items.filter((p) => p.category === cat);
  if (q) items = items.filter((p) => p.name.toLowerCase().includes(q));

  if (sort === "price-asc") items.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") items.sort((a, b) => b.price - a.price);
  if (sort === "name-asc") items.sort((a, b) => a.name.localeCompare(b.name));

  renderStore(items);
}

function addToCart(productId) {
  const product = storeProducts.find((p) => p.id === productId);
  if (!product) return;

  const existing = cart.find((c) => c.id === productId);
  if (existing) {
    existing.qty = clamp((existing.qty || 1) + 1, 1, 99);
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty: 1 });
  }

  persistCart();

  pushNotification({
    type: "cart",
    title: "Producto agregado 🛒",
    body: `${product.name} (${formatCLP(product.price)})`,
  });
}

function removeFromCart(productId) {
  cart = cart.filter((c) => c.id !== productId);
  persistCart();
  renderCartModal();
}

function updateCartQty(productId, nextQty) {
  const item = cart.find((c) => c.id === productId);
  if (!item) return;
  item.qty = clamp(nextQty, 1, 99);
  persistCart();
  renderCartModal();
}

function clearCart() {
  if (!confirm("¿Vaciar el carrito?")) return;
  cart = [];
  persistCart();
  renderCartModal();
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
}

function renderCartBadge() {
  const countEl = document.getElementById("cart-count");
  if (!countEl) return;
  const count = cart.reduce((sum, i) => sum + (i.qty || 1), 0);
  countEl.innerText = count;
}

function openCartModal() {
  renderCartModal();
  document.getElementById("cart-modal")?.classList.remove("hidden");
}

function closeCartModal() {
  document.getElementById("cart-modal")?.classList.add("hidden");
}

function renderCartModal() {
  const itemsEl = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  if (!itemsEl || !totalEl) return;

  if (!cart.length) {
    itemsEl.innerHTML = `<p class="text-xs text-[#90a9cb]">Tu carrito está vacío.</p>`;
    totalEl.innerText = formatCLP(0);
    return;
  }

  itemsEl.innerHTML = "";
  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "rounded-xl border border-[#223349] p-2 flex gap-3 items-center";

    row.innerHTML = `
      <img src="${item.image}" alt="" class="w-12 h-12 rounded-lg object-cover border border-[#223349]" />
      <div class="flex-1">
        <p class="text-sm font-semibold">${item.name}</p>
        <p class="text-xs text-[#90a9cb]">${formatCLP(item.price)} c/u</p>
        <div class="flex items-center gap-2 mt-2">
          <button class="text-xs px-2 py-1 rounded-full border border-[#223349]" data-dec="${item.id}">-</button>
          <p class="text-xs w-6 text-center">${item.qty || 1}</p>
          <button class="text-xs px-2 py-1 rounded-full border border-[#223349]" data-inc="${item.id}">+</button>
          <button class="text-xs px-3 py-1 rounded-full border border-[#223349] ml-auto" data-rm="${item.id}">
            Quitar
          </button>
        </div>
      </div>
    `;

    itemsEl.appendChild(row);
  });

  itemsEl.querySelectorAll("[data-dec]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-dec"));
      const it = cart.find((x) => x.id === id);
      if (!it) return;
      updateCartQty(id, (it.qty || 1) - 1);
    });
  });

  itemsEl.querySelectorAll("[data-inc]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-inc"));
      const it = cart.find((x) => x.id === id);
      if (!it) return;
      updateCartQty(id, (it.qty || 1) + 1);
    });
  });

  itemsEl.querySelectorAll("[data-rm]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-rm"));
      removeFromCart(id);
    });
  });

  totalEl.innerText = formatCLP(cartTotal());
}

function checkoutMVP() {
  if (!cart.length) {
    alert("Tu carrito está vacío.");
    return;
  }

  const total = cartTotal();

  // MVP: “compra” suma créditos proporcional
  const creditsEarned = Math.round(total * 0.01); // 1% del total como créditos
  addCredits(creditsEarned);
  setRewardsState(getRewardsState());
  renderRewards();

  pushNotification({
    type: "purchase",
    title: "Compra simulada ✅",
    body: `Total ${formatCLP(total)} • Créditos +${formatCLP(creditsEarned)}`,
  });

  cart = [];
  persistCart();
  renderCartModal();
  closeCartModal();

  alert(`Compra MVP realizada ✅\nTotal: ${formatCLP(total)}\nCréditos ganados: ${formatCLP(creditsEarned)}`);
}

// ==================== NOTIFICACIONES ====================
function pushNotification({ type = "info", title = "Notificación", body = "" }) {
  const item = {
    id: uid("notif"),
    type,
    title,
    body,
    createdAt: Date.now(),
    date: new Date().toLocaleString("es-CL"),
    read: false,
  };

  notifications = loadFromStorage("bai-notifs", []);
  notifications.push(item);
  saveToStorage("bai-notifs", notifications);

  renderNotifications();
}

function renderNotifications() {
  const list = document.getElementById("notif-list");
  if (!list) return;

  notifications = loadFromStorage("bai-notifs", []);
  const data = notifications.slice().reverse();

  if (!data.length) {
    list.innerHTML = `<p class="text-xs text-[#90a9cb]">Aún no tienes notificaciones.</p>`;
    return;
  }

  list.innerHTML = "";
  data.forEach((n) => {
    const card = document.createElement("div");
    card.className = "rounded-2xl border border-[#223349] p-3";
    card.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-sm font-semibold">${n.title}</p>
          <p class="text-[11px] text-[#90a9cb] mt-1">${n.date}</p>
        </div>
        <button class="text-xs px-3 py-1 rounded-full border border-[#223349]" data-del="${n.id}">
          Eliminar
        </button>
      </div>
      ${n.body ? `<p class="text-xs text-[#90a9cb] mt-2">${n.body}</p>` : ""}
    `;
    list.appendChild(card);
  });

  list.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-del");
      deleteNotification(id);
    });
  });
}

function deleteNotification(id) {
  notifications = loadFromStorage("bai-notifs", []);
  notifications = notifications.filter((n) => n.id !== id);
  saveToStorage("bai-notifs", notifications);
  renderNotifications();
}

function clearNotifications() {
  if (!confirm("¿Borrar todas las notificaciones?")) return;
  saveToStorage("bai-notifs", []);
  renderNotifications();
}

function addTestNotification() {
  const messages = [
    { title: "Tip de barba", body: "Perfila cada 7–10 días para mantener la línea prolija." },
    { title: "Tip de cabello", body: "Usa cera en poca cantidad y distribuye primero en manos." },
    { title: "Promo (MVP)", body: "Hoy: 10% en productos de cuidado (simulado)." },
  ];
  const m = messages[Math.floor(Math.random() * messages.length)];
  pushNotification({ type: "tip", title: m.title, body: m.body });
}

// ==================== HELPERS (clipboard / download) ====================
function copyText(text) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text);
  } else {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ==================== INIT APP ====================
function initApp() {
  // Cargar data persistida
  hydrateState();

  // Si hay usuario logueado, entra directo al home
  const savedUser = loadFromStorage("bai-user", null);
  if (savedUser?.name) {
    currentUser = savedUser;
    document.getElementById("btn-logout")?.classList.remove("hidden");
    document.getElementById("home-username").innerText = currentUser.name;

    initProfileFromStorage();
    updateHomeCards();
    renderBookings();
    renderRewards();
    renderGallery();
    renderNotifications();
    renderStore();
    renderCartBadge();

    showView("view-home");
  } else {
    showView("view-splash");
  }

  // Si viene con #ref=XXXX, lo guardamos (MVP)
  try {
    const hash = location.hash || "";
    if (hash.includes("ref=")) {
      const code = hash.split("ref=")[1]?.slice(0, 20);
      if (code) saveToStorage("bai-last-ref", code);
    }
  } catch {}

  // Defaults mínimos
  if (!loadFromStorage("bai-rewards", null)) setRewardsState({ credits: 0, referrals: 0 });
  if (!loadFromStorage("bai-gallery", null)) saveToStorage("bai-gallery", []);
  if (!loadFromStorage("bai-bookings", null)) saveToStorage("bai-bookings", []);
  if (!loadFromStorage("bai-notifs", null)) saveToStorage("bai-notifs", []);
  if (!loadFromStorage("bai-cart", null)) saveToStorage("bai-cart", []);
}

document.addEventListener("DOMContentLoaded", initApp);
/* =========================
   HOME UX CONTEXTUAL
========================= */

function goToPrimaryAction() {
  const profile = loadFromStorage("bai-profile", {});
  const gallery = loadFromStorage("bai-gallery", []);
  const bookings = loadFromStorage("bai-bookings", []);

  // 1️⃣ Usuario nuevo → completar perfil
  if (!profile.style) {
    showView("view-profile");
    return;
  }

  // 2️⃣ Sin estilos → usar IA
  if (gallery.length === 0) {
    showView("view-style");
    return;
  }

  // 3️⃣ Sin reservas → agendar
  if (bookings.length === 0) {
    showView("view-bookings");
    return;
  }

  // 4️⃣ Usuario activo → galería
  showView("view-gallery");
}
