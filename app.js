function updateHomeCards() {
  const bookings = loadFromStorage("bai-bookings", []);
  const nextEl = document.getElementById("home-next-booking");
  if (!nextEl) return;

  if (!bookings.length) {
    nextEl.innerText = "Aún no tienes reservas. Agenda tu próximo corte.";
    return;
  }

  const next = bookings[bookings.length - 1];

  const service = next.service || "Servicio";
  const barber = next.barber || "barbero recomendado";
  const date = next.date || "fecha por definir";
  const time = next.time || "hora por definir";

  nextEl.innerText = `${service} con ${barber} el ${date} a las ${time} hrs.`;
}
