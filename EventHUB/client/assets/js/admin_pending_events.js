console.log("Admin pending events loaded");

const token = localStorage.getItem("accessToken");
const container = document.getElementById("pendingEventsList");

async function loadPendingEvents() {
  const res = await fetch("/api/admin/events/pending", {
    headers: { "Authorization": "Bearer " + token }
  });

  const events = await res.json();
  container.innerHTML = "";

  if (!events.length) {
    container.innerHTML = `<p class="no-events">Nessun evento in attesa di approvazione.</p>`;
    return;
  }

  events.forEach(ev => {
    const username = ev.User?.username || "Sconosciuto";

    const col = document.createElement("div");
    col.classList.add("col-md-4", "d-flex");

    const card = document.createElement("div");
    card.classList.add("card", "event-card", "shadow-sm", "flex-fill");

    const body = document.createElement("div");
    body.classList.add("event-card-body");

    const title = document.createElement("h5");
    title.classList.add("fw-bold");
    title.textContent = ev.title;

    const creator = document.createElement("p");
    creator.classList.add("text-muted");
    creator.innerHTML = `Creato da: <strong>${username}</strong>`;

    const btns = document.createElement("div");
    btns.classList.add("event-card-buttons", "d-flex", "justify-content-between", "mt-3");

    btns.innerHTML = `
      <button class="btn btn-outline-success btn-sm d-flex align-items-center gap-2" onclick="approve('${ev.id}')">
        <i class="bi bi-check2-circle"></i> Approva
      </button>
      <button class="btn btn-outline-danger btn-sm d-flex align-items-center gap-2" onclick="reject('${ev.id}')">
        <i class="bi bi-x-circle"></i> Rifiuta
      </button>
    `;

    body.append(title, creator, btns);
    card.appendChild(body);
    col.appendChild(card);
    container.appendChild(col);
  });
}

async function approve(id) {
  await fetch(`/api/admin/events/${id}/approve`, {
    method: "PUT",
    headers: { "Authorization": "Bearer " + token }
  });
  loadPendingEvents();
}

async function reject(id) {
  await fetch(`/api/admin/events/${id}/reject`, {
    method: "PUT",
    headers: { "Authorization": "Bearer " + token }
  });
  loadPendingEvents();
}

loadPendingEvents();

/* area socket.io */    


// Connessione al server via Socket.io
const socket = io("http://localhost:4000");

// Ascolta la notifica di nuova iscrizione
socket.on('new-registration', (data) => {
  console.log("Nuova iscrizione:", data);
  // Logica per aggiornare la lista eventi in tempo reale
  loadPendingEvents();
});

// Ascolta la notifica di disiscrizione
socket.on('user-unsubscribed', (data) => {
  console.log("Disiscrizione evento:", data);
  // Logica per aggiornare la lista eventi in tempo reale
  loadPendingEvents();
});

// Ascolta la notifica di evento segnalato
socket.on('event-reported', (data) => {
  console.log("Evento segnalato:", data);
  // Logica per mostrare un messaggio di notifica agli admin
});