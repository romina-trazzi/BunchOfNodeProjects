console.log("Admin pending events loaded");

// Token & container
const token = localStorage.getItem("accessToken");
const container = document.getElementById("pendingEventsList");

// ===============================================
// CARICA EVENTI IN PENDING
// ===============================================
async function loadPendingEvents() {
  const res = await fetch("/api/admin/events/pending", {
    headers: { "Authorization": "Bearer " + token }
  });

  const events = await res.json();
  container.innerHTML = "";

  if (!events.length) {
    container.innerHTML = `<p class="no-events text-muted">Nessun evento in attesa di approvazione.</p>`;
    return;
  }

  events.forEach(ev => {
    const username = ev.User?.username || "Sconosciuto";

    // col
    const col = document.createElement("div");
    col.classList.add("col-md-4", "d-flex");

    // card
    const card = document.createElement("div");
    card.classList.add("card", "event-card", "shadow-sm", "flex-fill");

    // body
    const body = document.createElement("div");
    body.classList.add("event-card-body");

    const title = document.createElement("h5");
    title.classList.add("fw-bold");
    title.textContent = ev.title;

    const creator = document.createElement("p");
    creator.classList.add("text-muted");
    creator.innerHTML = `Creato da: <strong>${username}</strong>`;

    // pulsanti
    const btns = document.createElement("div");
    btns.classList.add("event-card-buttons", "d-flex", "justify-content-between", "mt-3");

    btns.innerHTML = `
      <button 
        class="btn btn-outline-success btn-sm d-flex align-items-center gap-2 approve-btn"
        data-id="${ev.id}">
        <i class="bi bi-check2-circle"></i> Approva
      </button>

      <button 
        class="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 reject-btn"
        data-id="${ev.id}">
        <i class="bi bi-x-circle"></i> Rifiuta
      </button>
    `;

    const approveBtn = btns.querySelector(".approve-btn");
    const rejectBtn  = btns.querySelector(".reject-btn");

    approveBtn.addEventListener("click", () => approve(ev.id));
    rejectBtn.addEventListener("click", () => reject(ev.id));

    // monta card
    body.append(title, creator, btns);
    card.appendChild(body);
    col.appendChild(card);
    container.appendChild(col);
  });
}

// ===============================================
// APPROVA EVENTO
// ===============================================
async function approve(id) {
  await fetch(`/api/admin/events/${id}/approve`, {
    method: "PUT",
    headers: { "Authorization": "Bearer " + token }
  });
  loadPendingEvents();
}

// ===============================================
// RIFIUTA EVENTO
// ===============================================
async function reject(id) {
  await fetch(`/api/admin/events/${id}/reject`, {
    method: "PUT",
    headers: { "Authorization": "Bearer " + token }
  });
  loadPendingEvents();
}

// ===============================================
// AVVIO
// ===============================================
loadPendingEvents();

// ===============================================
// SOCKET.IO
// ===============================================
const socket = io();

// Notifiche realtime
socket.on("new-registration", (data) => {
  console.log("Nuova iscrizione:", data);
  loadPendingEvents();
});

socket.on("user-unsubscribed", (data) => {
  console.log("Disiscrizione:", data);
  loadPendingEvents();
});

socket.on("event-reported", (data) => {
  console.log("Evento segnalato:", data);
  
});
