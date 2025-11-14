import { tokenFetch } from "./helpers/tokenFetch.js";

console.log("Dashboard loaded ✅");

document.addEventListener("DOMContentLoaded", () => {

  // ============================================================
  // 1. RECUPERO DATI UTENTE E VALIDAZIONE ACCESSO
  // ============================================================

  const username    = localStorage.getItem("username");
  const role        = localStorage.getItem("userRole");
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    window.location.href = "/pages/login.html";
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
  // 2. GESTIONE APERTURA / CHIUSURA FORM CREAZIONE EVENTO
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
  // 3. SUBMIT FORM CREAZIONE EVENTO
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
  // 4. FUNZIONE CARICA EVENTI CREATI (senza HTML nel JS)
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
      body.classList.add("card-body", "event-card-body", "d-flex", "flex-column", "justify-content-between");

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

      const delBtn = document.createElement("button");
      delBtn.classList.add("btn", "btn-danger", "btn-sm");
      delBtn.textContent = "Elimina";

      btnGroup.append(editBtn, delBtn);

      // montaggio
      body.append(title, date, loc, cat, desc, btnGroup, );
      card.appendChild(body);
      col.appendChild(card);
      container.appendChild(col);
    });
  }

  // ============================================================
  // 5. GESTISCI VISIBILITÀ SEZIONE MIEI EVENTI
  // ============================================================

  const showMyEventsBtn  = document.getElementById("showMyEventsBtn");
  const myEventsSection  = document.getElementById("myEventsSection");
  const closeMyEventsBtn = document.getElementById("closeMyEventsBtn");

  if (showMyEventsBtn) {
    showMyEventsBtn.addEventListener("click", async () => {
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
  // 4. LOGOUT (desktop + mobile)
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