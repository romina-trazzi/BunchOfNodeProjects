import { tokenFetch } from "./helpers/tokenFetch.js";

console.log("Dashboard loaded ✅");

document.addEventListener("DOMContentLoaded", () => {

  // ============================================================
  // RECUPERO DATI UTENTE E VALIDAZIONE ACCESSO
  // ============================================================

  const username    = localStorage.getItem("username");
  const role        = localStorage.getItem("userRole");
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    window.location.href = "../../index.html";
    return;
  }

  document.getElementById("usernameDisplay").textContent = username || "Utente";
  document.getElementById("welcomeUser").textContent     = username || "Utente";

  if (role === "ADMIN") {
    document.getElementById("adminSection").classList.remove("d-none");
  }

  // Notifiche simulate
  const notifBadge = document.getElementById("notifBadge");
  setTimeout(() => {
    notifBadge.textContent = Math.floor(Math.random() * 5);
    notifBadge.classList.add("pulse");
  }, 2000);


  // ============================================================
  // GESTIONE APERTURA / CHIUSURA FORM CREAZIONE EVENTO
  // ============================================================

  const openCreateBtn = document.getElementById("openCreateEventBtn");
  const createSection = document.getElementById("createEventSection");
  const eventForm     = document.getElementById("createEventForm");
  const cancelBtn     = document.getElementById("cancelEventBtn");
  const cardsRow      = document.querySelector(".dashboard-container .row");

  if (openCreateBtn) {
    openCreateBtn.addEventListener("click", () => {
      cardsRow?.classList.add("creating");
      createSection.classList.remove("d-none");
      createSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      eventForm.reset();
      createSection.classList.add("d-none");
      cardsRow?.classList.remove("creating");
    });
  }


  // ============================================================
  // SUBMIT FORM CREAZIONE EVENTO
  // ============================================================ 

  if (eventForm) {
  eventForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title       = document.getElementById("eventTitle").value.trim();
    const description = document.getElementById("eventDescription").value.trim();
    const startsAt    = document.getElementById("eventDate").value;
    const capacity    = parseInt(document.getElementById("eventCapacity").value);
    const location    = document.getElementById("eventLocation").value.trim();
    const category    = document.getElementById("eventCategory").value.trim();  
    const imageFile   = document.getElementById("eventImage").files[0];
    const imageUrl    = imageFile ? imageFile.name : null;

    if (!title || !startsAt || !capacity) {
      alert("Titolo, data e capienza sono obbligatori.");
      return;
    }

    const newEvent = {
      title,
      description,
      category, 
      location,   
      startsAt,
      capacity,
      imageUrl
    };

    console.log("Invio evento al server:", newEvent);

    const result = await tokenFetch("/api/events", {
      method: "POST",
      body: JSON.stringify(newEvent),
    });

    if (!result || result.error) {
      alert(result?.error || "Errore durante la creazione dell’evento.");
      return;
    }

    alert("Evento creato con successo!");
    eventForm.reset();
    createSection.classList.add("d-none");
    cardsRow?.classList.remove("creating");
  });
  }

  // ============================================================
  // FUNZIONE CARICA EVENTI CREATI (senza HTML nel JS)
  // ============================================================

  async function loadMyEvents() {
    const events = await tokenFetch("/api/events/mine_events");
    const container = document.getElementById("myEventsContainer");

    container.innerHTML = ""; 

    // Nessun evento
    if (!events || events.length === 0) {
      const msg = document.createElement("p");
      msg.classList.add("text-center", "text-muted");
      msg.textContent = `Nessun evento creato da ${username}.`;
      container.appendChild(msg);
      return;
    }

    // Lista eventi
    events.forEach(evt => {

      // col
      const col = document.createElement("div");
      col.classList.add("col-md-4", "d-flex");

      // card
      const card = document.createElement("div");
      card.classList.add("card", "shadow-sm", "event-card");

      // body
      const body = document.createElement("div");
      body.classList.add("spacer");

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

      // descrizione
      const desc = document.createElement("p");
      desc.innerHTML = `<strong>Descrizione:</strong> ${evt.description}`;
      desc.classList.add("card-description");

      // gruppo bottoni
      const btnGroup = document.createElement("div");btnGroup.classList.add("event-card-buttons", "d-flex", "justify-content-between", "mt-3");
      btnGroup.classList.add("mt-3", "d-flex", "justify-content-between");

      const editBtn = document.createElement("button");
      editBtn.classList.add("btn", "btn-warning", "btn-sm");
      editBtn.textContent = "Modifica";

      editBtn.addEventListener("click", () => showEditModal(evt));

      const delBtn = document.createElement("button");
      delBtn.classList.add("btn", "btn-danger", "btn-sm");
      delBtn.textContent = "Elimina";
      delBtn.addEventListener("click", () => showDeleteModal(evt.id));

      btnGroup.append(editBtn, delBtn);

      // montaggio
      body.append(title, date, loc, cat, desc, btnGroup, );
      card.appendChild(body);
      col.appendChild(card);
      container.appendChild(col);
    });
  }

  // ============================================================
  // GESTISCI VISIBILITÀ SEZIONE MIEI EVENTI
  // ============================================================

  const showMyEventsBtn  = document.getElementById("showMyEventsBtn");
  const myEventsSection  = document.getElementById("myEventsSection");
  const closeMyEventsBtn = document.getElementById("closeMyEventsBtn");

  if (showMyEventsBtn) {
    showMyEventsBtn.addEventListener("click", async () => {
      cardsRow.classList.remove("creating");
      createSection.classList.add("d-none");
      cardsRow.classList.add("d-none");          // nasconde le 3 card
      myEventsSection.classList.remove("d-none"); // mostra sezione eventi
      await loadMyEvents();                       // carica i dati
    });
  }

  if (closeMyEventsBtn) {
    closeMyEventsBtn.addEventListener("click", () => {
      myEventsSection.classList.add("d-none");     // nasconde sezione
      cardsRow.classList.remove("d-none");         // mostra le 3 card
    });
  }
    


  // ============================================================
  // MOSTRA MODALE DI ELIMINAZIONE
  // ============================================================
  let eventIdToDelete = null;

  function showDeleteModal(eventId) {
    eventIdToDelete = eventId;
    const modal = new bootstrap.Modal(document.getElementById("deleteConfirmModal"));
    modal.show();
  }

  document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
    if (eventIdToDelete) {
      deleteEvent(eventIdToDelete);
      eventIdToDelete = null;
    }

    const modalEl = document.getElementById("deleteConfirmModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
  });

  // ============================================================
  // MODIFICA EVENTO - VARIABILI E FUNZIONI MODALE
  // ============================================================

  let eventIdToEdit = null;

  function showEditModal(event) {
    eventIdToEdit = event.id;

    // Precompila i campi della modale
    document.getElementById("editTitle").value       = event.title;
    document.getElementById("editDescription").value = event.description || "";
    document.getElementById("editDate").value        = event.startsAt.split("T")[0];
    document.getElementById("editCapacity").value    = event.capacity;
    document.getElementById("editCategory").value    = event.category || "";
    document.getElementById("editLocation").value    = event.location || "";
    document.getElementById("editImageUrl").value    = event.imageUrl || "";

    // Apri la modale
    const modal = new bootstrap.Modal(document.getElementById("editEventModal"));
    modal.show();
  }

  async function saveEditedEvent() {
    if (!eventIdToEdit) return;

    const updatedEvent = {
      title:       document.getElementById("editTitle").value.trim(),
      description: document.getElementById("editDescription").value.trim(),
      startsAt:    document.getElementById("editDate").value,
      capacity:    parseInt(document.getElementById("editCapacity").value),
      category:    document.getElementById("editCategory").value.trim(),
      location:    document.getElementById("editLocation").value.trim(),
      imageUrl:    document.getElementById("editImageUrl").value.trim()
    };

    try {
      const result = await tokenFetch(`/api/events/${eventIdToEdit}`, {
        method: "PUT",
        body: JSON.stringify(updatedEvent),
      });

      if (result.error) {
        alert(result.error);
        return;
      }

      // Chiudi la modale
      const modalEl = document.getElementById("editEventModal");
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();

      // Aggiorna lista eventi
      loadMyEvents();

    } catch (err) {
      console.error("Errore update evento:", err);
      alert("Errore del server");
    }
  }

  // Pulsante SALVA nella modale
  document.getElementById("saveEditBtn").addEventListener("click", saveEditedEvent)

  // ============================================================
  // ELIMINA EVENTO CREATO DA UN UTENTE
  // ============================================================
  async function deleteEvent(eventId) {
    try {
      const result = await tokenFetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      });

      if (result.error) {
        alert(result.error);
        return;
      }
      loadMyEvents();

    } catch (err) {
      console.error("Errore durante la richiesta DELETE:", err);
      alert("Errore del server");
    }
  }


  // ============================================================
  //  EVENTI A CUI PARTECIPA L'UTENTE
  // ============================================================

  const showMySubscribedBtn = document.getElementById("showMySubscribedBtn");
  const mySubscribedEventsSection = document.getElementById("mySubscribedEventsSection");
  const mySubscribedEventsContainer = document.getElementById("mySubscribedEventsContainer");
  const closeSubscribedEventsBtn = document.getElementById("closeSubscribedEventsBtn");

  // Funzione per caricare gli eventi a cui l’utente è iscritto
  async function loadMySubscribedEvents() {
    mySubscribedEventsContainer.innerHTML = `
      <div class="text-center py-3">
        <div class="spinner-border text-primary"></div>
        <p class="text-muted mt-2">Caricamento eventi...</p>
      </div>
    `;

    const events = await tokenFetch("/api/events/subscribed");

    mySubscribedEventsContainer.innerHTML = "";

    if (!events || events.length === 0) {
      mySubscribedEventsContainer.innerHTML = `
        <p class="text-center text-muted">Non sei iscritto ad alcun evento.</p>
      `;
      return;
    }

    
    events.forEach(evt => {
      const col = document.createElement("div");
      col.classList.add("col-md-4", "d-flex");

      const card = document.createElement("div");
      card.classList.add("card", "shadow-sm", "event-card", "flex-fill");

      const body = document.createElement("div");
      body.classList.add("event-card-body", "d-flex", "flex-column");

      const title = document.createElement("h5");
      title.classList.add("fw-bold");
      title.textContent = evt.title;

      const date = document.createElement("p");
      date.classList.add("text-muted");
      date.textContent = evt.startsAt.split("T")[0];

      const loc = document.createElement("p");
      loc.innerHTML = `<strong>Luogo:</strong> ${evt.location}`;

      const cat = document.createElement("p");
      cat.innerHTML = `<strong>Categoria:</strong> ${evt.category}`;

      const desc = document.createElement("p");
      desc.classList.add("card-description");
      desc.innerHTML = `<strong>Descrizione:</strong> ${evt.description}`;

      const badge = document.createElement("span");
      badge.classList.add("badge", "bg-success", "mb-2");
      badge.textContent = "Iscritto";

      const btnGroup = document.createElement("div");
      btnGroup.classList.add("d-flex", "justify-content-between", "mt-auto");

      const unsubBtn = document.createElement("button");
      unsubBtn.classList.add("btn", "btn-danger", "btn-sm");
      unsubBtn.textContent = "Disiscriviti";

      unsubBtn.addEventListener("click", async () => {
        await tokenFetch(`/api/events/${evt.id}/unsubscribe`, { method: "DELETE" });
        loadMySubscribedEvents();
      });

      btnGroup.append(unsubBtn);

      body.append(badge, title, date, loc, cat, desc, btnGroup);
      card.appendChild(body);
      col.appendChild(card);
      mySubscribedEventsContainer.appendChild(col);
    });
  }

  // Pulsante "Apri"
  showMySubscribedBtn?.addEventListener("click", async () => {
    mainCardsRow.classList.add("d-none");
    myEventsSection.classList.add("d-none");
    createEventSection.classList.add("d-none");

    mySubscribedEventsSection.classList.remove("d-none");

    await loadMySubscribedEvents();
  });

  // Pulsante "Chiudi"
  closeSubscribedEventsBtn?.addEventListener("click", () => {
    mySubscribedEventsSection.classList.add("d-none");
    mainCardsRow.classList.remove("d-none");
  });

  document.getElementById("openCatalogueBtn")?.addEventListener("click", () => {
    window.location.href = "./catalogue.html";
  });




  // ============================================================
  // LOGOUT (desktop + mobile)
  // ============================================================

  const logout = () => {
    document.body.classList.add("fade-out");
    setTimeout(() => {
      localStorage.clear();
      window.location.href = "../../index.html";
    }, 600);
  };

  document.getElementById("logoutBtn")?.addEventListener("click", logout);
  document.getElementById("logoutBtnMobile")?.addEventListener("click", logout);
});