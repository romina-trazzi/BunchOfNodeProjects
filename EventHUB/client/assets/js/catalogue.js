import { tokenFetch } from "./helpers/tokenFetch.js";

console.log("Catalogue loaded ✅");

document.addEventListener("DOMContentLoaded", async () => {

  // ============================================================
  // VARIABILI GLOBALI
  // ============================================================
  const userId = localStorage.getItem("userId");
  const container = document.getElementById("catalogueContainer");

  const filterTitle = document.getElementById("filterTitle");
  const filterMonth = document.getElementById("filterMonth");
  const filterCategory = document.getElementById("filterCategory");
  const filterLocation = document.getElementById("filterLocation");

  let allEvents = [];
  let subscriptions = []; // array di id degli eventi a cui l’utente è iscritto


  // ============================================================
  // PLACEHOLDER LOADING
  // ============================================================
  function showLoading() {
    container.innerHTML = `
      <div class="catalogue-loading">
        <div class="spinner-border text-primary"></div>
        <p>Caricamento eventi...</p>
      </div>
    `;
  }


  // ============================================================
  // CARICA EVENTI + ISCRIZIONI
  // ============================================================
  async function loadEvents() {
    showLoading();

    // Carica tutti gli eventi pubblici
    const events = await tokenFetch("/api/events");
    allEvents = events || [];

    // Carica le iscrizioni dell’utente (compreso l’organizzatore)
    const subs = await tokenFetch("/api/events/subscribed");
    subscriptions = subs.map(e => e.id);

    renderEvents(allEvents);
  }


  // ============================================================
  // CREAZIONE CARD EVENTO
  // ============================================================
  function renderEvents(list) {
    container.innerHTML = "";

    if (!list || list.length === 0) {
      container.innerHTML = `
        <p class="no-events">Nessun evento trovato.</p>
      `;
      return;
    }

    list.forEach(evt => {
      // colonna
      const col = document.createElement("div");
      col.classList.add("col-md-4", "d-flex");

      // card
      const card = document.createElement("div");
      card.classList.add("card", "event-card", "shadow-sm", "flex-fill");

      // body
      const body = document.createElement("div");
      body.classList.add("event-card-body");

      // badge ORGANIZZATORE
      if (evt.ownerId == userId) {
        const badge = document.createElement("span");
        badge.classList.add("badge", "badge-organizer", "mb-2");
        badge.textContent = "Organizzatore";
        body.appendChild(badge);
      }

      // badge ISCRITTO
      if (subscriptions.includes(evt.id)) {
        const badge = document.createElement("span");
        badge.classList.add("badge", "badge-subscribed", "mb-2");
        badge.textContent = "Iscritto";
        body.appendChild(badge);
      }

      // titolo
      const title = document.createElement("h5");
      title.classList.add("fw-bold");
      title.textContent = evt.title;

      // data
      const date = document.createElement("p");
      date.classList.add("text-muted");
      date.textContent = evt.startsAt.split("T")[0];

      // luogo
      const loc = document.createElement("p");
      loc.innerHTML = `<strong>Luogo:</strong> ${evt.location}`;

      // categoria
      const cat = document.createElement("p");
      cat.innerHTML = `<strong>Categoria:</strong> ${evt.category}`;

      // descrizione (troncata)
      const desc = document.createElement("p");
      desc.classList.add("card-description");
      desc.innerHTML = `<strong>Descrizione:</strong> ${evt.description}`;

      // gruppo bottoni
      const btnGroup = document.createElement("div");
      btnGroup.classList.add("event-card-buttons", "d-flex", "justify-content-between", "mt-auto");

      const subBtn = document.createElement("button");
      subBtn.classList.add("btn", "btn-sm");

      // LOGICA ISCRIZIONE → TUTTI uguali ora (organizzatore incluso)
      if (subscriptions.includes(evt.id)) {
        subBtn.classList.add("btn-danger");
        subBtn.textContent = "Disiscriviti";
        subBtn.addEventListener("click", () => unsubscribe(evt.id));
      } else {
        subBtn.classList.add("btn-success");
        subBtn.textContent = "Iscriviti";
        subBtn.addEventListener("click", () => subscribe(evt.id));
      }

      btnGroup.appendChild(subBtn);

      // montaggio
      body.append(title, date, loc, cat, desc, btnGroup);
      card.appendChild(body);
      col.appendChild(card);
      container.appendChild(col);
    });
  }


  // ============================================================
  // FILTRI FRONTEND - LIVE
  // ============================================================
  function applyFilters() {
    let filtered = [...allEvents];

    const t = filterTitle.value.toLowerCase().trim();
    const m = filterMonth.value;
    const c = filterCategory.value;
    const l = filterLocation.value.toLowerCase().trim();

    if (t) filtered = filtered.filter(e => e.title.toLowerCase().includes(t));
    if (m) filtered = filtered.filter(e => e.startsAt.slice(5, 7) === m);
    if (c) filtered = filtered.filter(e => e.category === c);
    if (l) filtered = filtered.filter(e => e.location.toLowerCase().includes(l));

    renderEvents(filtered);
  }

  filterTitle.addEventListener("input", applyFilters);
  filterMonth.addEventListener("change", applyFilters);
  filterCategory.addEventListener("change", applyFilters);
  filterLocation.addEventListener("input", applyFilters);

  // ============================================================
  // RESET FILTRI
  // ============================================================
  document.getElementById("resetFiltersBtn").addEventListener("click", () => {
    filterTitle.value = "";
    filterMonth.value = "";
    filterCategory.value = "";
    filterLocation.value = "";

    renderEvents(allEvents);  // torna a mostrare tutto
  });
  


  // ============================================================
  // ISCRIZIONE / DISISCRIZIONE
  // ============================================================
  async function subscribe(eventId) {
    const res = await tokenFetch(`/api/events/${eventId}/subscribe`, {
      method: "POST"
    });

    if (!res.error) loadEvents();
  }

  async function unsubscribe(eventId) {
    const res = await tokenFetch(`/api/events/${eventId}/unsubscribe`, {
      method: "DELETE"
    });

    if (!res.error) loadEvents();
  }


  // ============================================================
  // AVVIO
  // ============================================================
  await loadEvents();
});
