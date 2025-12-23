let currentUser = { name: "Invitado" };

function showView(id) {
  document.querySelectorAll(".view").forEach(v => {
    v.classList.add("hidden");
    v.classList.remove("active");
  });
  document.getElementById(id).classList.remove("hidden");
  document.getElementById(id).classList.add("active");
}

function saveToStorage(k, v) {
  localStorage.setItem(k, JSON.stringify(v));
}

function loadFromStorage(k, d) {
  return JSON.parse(localStorage.getItem(k)) || d;
}

/* PERFIL */
function saveProfile() {
  const style = document.getElementById("profile-style").value;
  saveToStorage("bai-profile", { style });
  renderHome();
  alert("Perfil guardado");
}

/* ESTILOS */
function saveStyle() {
  const styles = loadFromStorage("bai-gallery", []);
  styles.push({ date: Date.now() });
  saveToStorage("bai-gallery", styles);
  renderHome();
}

/* RESERVAS */
function saveBooking() {
  const bookings = loadFromStorage("bai-bookings", []);
  bookings.push({ date: Date.now() });
  saveToStorage("bai-bookings", bookings);
  renderHome();
}

/* HOME UX */
function goToPrimaryAction() {
  const profile = loadFromStorage("bai-profile", {});
  const gallery = loadFromStorage("bai-gallery", []);
  const bookings = loadFromStorage("bai-bookings", []);

  if (!profile.style) return showView("view-profile");
  if (!gallery.length) return showView("view-style");
  if (!bookings.length) return showView("view-bookings");
  showView("view-gallery");
}

function renderHomeActions() {
  const el = document.getElementById("home-actions");
  const gallery = loadFromStorage("bai-gallery", []);
  const bookings = loadFromStorage("bai-bookings", []);

  el.innerHTML = `
    <button class="btn-secondary" onclick="showView('${gallery.length ? "view-gallery" : "view-style"}')">
      ${gallery.length ? "Ver estilos" : "Crear estilo"}
    </button>
    <button class="btn-secondary" onclick="showView('view-bookings')">
      ${bookings.length ? "Ver reservas" : "Agendar servicio"}
    </button>
    <button class="btn-secondary col-span-2" onclick="showView('view-rewards')">
      Créditos
    </button>
  `;
}

function updateHomePrimaryCTA() {
  const cta = document.getElementById("home-primary-cta");
  const profile = loadFromStorage("bai-profile", {});
  const gallery = loadFromStorage("bai-gallery", []);
  const bookings = loadFromStorage("bai-bookings", []);

  if (!profile.style) cta.innerText = "Completar mi perfil";
  else if (!gallery.length) cta.innerText = "Crear mi primer estilo";
  else if (!bookings.length) cta.innerText = "Agendar mi servicio";
  else cta.innerText = "Ver mis estilos";
}

function renderHome() {
  document.getElementById("home-username").innerText = currentUser.name;
  renderHomeActions();
  updateHomePrimaryCTA();
}

renderHome();
